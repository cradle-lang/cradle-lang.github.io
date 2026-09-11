import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import {isCommitSha} from './release-identity.mjs';
import {
  compareReleaseTags,
  isProductionRelease,
  parseReleaseTag,
} from './release-policy.mjs';

export const RELEASE_EVIDENCE_SCHEMA_VERSION = 1;

const STATUS_NAMES = {
  A: 'added',
  B: 'pairing-broken',
  C: 'copied',
  D: 'deleted',
  M: 'modified',
  R: 'renamed',
  T: 'type-changed',
  U: 'unmerged',
  X: 'unknown',
};

function runGit(repositoryDirectory, arguments_) {
  return execFileSync(
    'git',
    ['-C', repositoryDirectory, ...arguments_],
    {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

function resolveCommit(repositoryDirectory, tag) {
  const sha = runGit(repositoryDirectory, [
    'rev-list',
    '-n',
    '1',
    tag,
  ]).trim();

  if (!isCommitSha(sha)) {
    throw new Error(`Could not resolve ${tag} to a full commit SHA`);
  }

  return sha.toLowerCase();
}

function sourceArea(filePath) {
  const separator = filePath.indexOf('/');
  return separator === -1 ? filePath : filePath.slice(0, separator);
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function evidencePayload(evidence) {
  const {sha256: _sha256, ...payload} = evidence;
  return payload;
}

export function calculateReleaseEvidenceSha256(evidence) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(evidencePayload(evidence)))
    .digest('hex');
}

export function parseChangedFiles(output) {
  const fields = output.split('\0');
  if (fields.at(-1) === '') {
    fields.pop();
  }

  const files = [];
  for (let index = 0; index < fields.length;) {
    const rawStatus = fields[index++];
    const statusCode = rawStatus?.[0];
    const status = STATUS_NAMES[statusCode];

    if (!status) {
      throw new Error(`Unsupported Git file status: ${rawStatus}`);
    }

    const firstPath = fields[index++];
    if (!firstPath) {
      throw new Error(`Missing path for Git file status ${rawStatus}`);
    }

    if (statusCode === 'R' || statusCode === 'C') {
      const secondPath = fields[index++];
      if (!secondPath) {
        throw new Error(`Missing destination path for Git status ${rawStatus}`);
      }
      files.push({
        status,
        similarity: Number.parseInt(rawStatus.slice(1), 10),
        oldPath: firstPath,
        path: secondPath,
      });
    } else {
      files.push({status, path: firstPath});
    }
  }

  return files.sort((left, right) => compareText(left.path, right.path));
}

export function createReleaseEvidence({
  fromTag,
  fromSha,
  toTag,
  toSha,
  mergeBaseSha,
  commits,
  files,
}) {
  if (!parseReleaseTag(fromTag) || !parseReleaseTag(toTag)) {
    throw new TypeError('Release evidence tags must be valid semantic versions');
  }

  if (![fromSha, toSha, mergeBaseSha].every(isCommitSha)) {
    throw new TypeError(
      'Release evidence requires full 40-character commit SHAs',
    );
  }

  const normalizedCommits = commits.map(({sha, subject}) => {
    if (!isCommitSha(sha) || typeof subject !== 'string') {
      throw new TypeError('Each release evidence commit requires a SHA and subject');
    }
    return {sha: sha.toLowerCase(), subject};
  });
  const normalizedFiles = files.map((file) => ({...file}));
  const countsByStatus = Object.fromEntries(
    [...new Set(normalizedFiles.map(({status}) => status))]
      .sort()
      .map((status) => [
        status,
        normalizedFiles.filter((file) => file.status === status).length,
      ]),
  );
  const areas = [...new Set(
    normalizedFiles.flatMap((file) => [
      sourceArea(file.path),
      ...(file.oldPath ? [sourceArea(file.oldPath)] : []),
    ]),
  )].sort(compareText);

  const payload = {
    schemaVersion: RELEASE_EVIDENCE_SCHEMA_VERSION,
    from: {tag: fromTag, sha: fromSha.toLowerCase()},
    to: {tag: toTag, sha: toSha.toLowerCase()},
    comparison: {
      range: `${fromTag}..${toTag}`,
      mergeBaseSha: mergeBaseSha.toLowerCase(),
      fromIsAncestor: mergeBaseSha.toLowerCase() === fromSha.toLowerCase(),
    },
    counts: {
      commits: normalizedCommits.length,
      files: normalizedFiles.length,
      byStatus: countsByStatus,
    },
    sourceAreas: areas,
    commits: normalizedCommits,
    files: normalizedFiles,
  };

  return {
    ...payload,
    sha256: calculateReleaseEvidenceSha256(payload),
  };
}

export function verifyReleaseEvidenceIntegrity(evidence) {
  if (evidence.schemaVersion !== RELEASE_EVIDENCE_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported release evidence schema: ${evidence.schemaVersion}`,
    );
  }

  const expected = calculateReleaseEvidenceSha256(evidence);
  if (evidence.sha256 !== expected) {
    throw new Error('Release evidence checksum does not match its contents');
  }

  return evidence;
}

export function collectReleaseEvidence({
  repositoryDirectory,
  fromTag,
  toTag,
}) {
  const fromSha = resolveCommit(repositoryDirectory, fromTag);
  const toSha = resolveCommit(repositoryDirectory, toTag);
  const mergeBaseSha = runGit(repositoryDirectory, [
    'merge-base',
    fromSha,
    toSha,
  ]).trim().toLowerCase();
  if (!isCommitSha(mergeBaseSha)) {
    throw new Error(`Could not determine a merge base for ${fromTag} and ${toTag}`);
  }

  const commitShas = runGit(repositoryDirectory, [
    'rev-list',
    '--reverse',
    `${fromSha}..${toSha}`,
  ]).trim().split('\n').filter(Boolean);
  const commits = commitShas.map((sha) => ({
    sha,
    subject: runGit(repositoryDirectory, [
      'show',
      '--no-patch',
      '--format=%s',
      sha,
    ]).trim(),
  }));
  const files = parseChangedFiles(runGit(repositoryDirectory, [
    'diff',
    '--name-status',
    '-z',
    '--find-renames',
    fromSha,
    toSha,
    '--',
  ]));

  return createReleaseEvidence({
    fromTag,
    fromSha,
    toTag,
    toSha,
    mergeBaseSha,
    commits,
    files,
  });
}

export async function writeReleaseEvidence(outputDirectory, evidence) {
  const outputPath = path.join(outputDirectory, `${evidence.to.tag}.json`);
  await writeReleaseEvidenceFile(outputPath, evidence);
  return outputPath;
}

export async function writeReleaseEvidenceFile(outputPath, evidence) {
  verifyReleaseEvidenceIntegrity(evidence);
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8',
  );
}

export async function readReleaseEvidence(releaseNotesDirectory) {
  const evidenceDirectory = path.join(releaseNotesDirectory, 'evidence');
  let entries;

  try {
    entries = await fs.readdir(evidenceDirectory, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map(async (entry) => {
        const filePath = path.join(evidenceDirectory, entry.name);
        const evidence = JSON.parse(await fs.readFile(filePath, 'utf8'));
        verifyReleaseEvidenceIntegrity(evidence);
        if (entry.name !== `${evidence.to?.tag}.json`) {
          throw new Error(
            `Release evidence filename does not match ${evidence.to?.tag}`,
          );
        }
        return evidence;
      }),
  );
}

export function verifyReleaseEvidenceMetadata({
  completedTags,
  upstreamReleases,
  evidenceRecords,
  provenanceRecords,
  exemptTags = [],
}) {
  const completed = new Set(completedTags);
  const exemptions = new Set(exemptTags);
  const upstreamByTag = new Map(
    upstreamReleases.map(({tag, sha}) => [tag, sha.toLowerCase()]),
  );
  const provenanceByTag = new Map(
    provenanceRecords.map((record) => [record.tag, record]),
  );
  const evidenceByTag = new Map();

  for (const evidence of evidenceRecords) {
    const tag = evidence.to.tag;
    if (evidenceByTag.has(tag)) {
      throw new Error(`Duplicate release evidence for ${tag}`);
    }
    if (!isProductionRelease(tag) || !isProductionRelease(evidence.from.tag)) {
      throw new Error(`Non-production release evidence must not be merged: ${tag}`);
    }
    if (compareReleaseTags(evidence.from.tag, tag) >= 0) {
      throw new Error(`Release evidence predecessor must precede ${tag}`);
    }
    if (!evidence.comparison.fromIsAncestor) {
      throw new Error(`Release evidence predecessor is not an ancestor of ${tag}`);
    }

    const upstreamToSha = upstreamByTag.get(tag);
    const upstreamFromSha = upstreamByTag.get(evidence.from.tag);
    if (upstreamToSha !== evidence.to.sha) {
      throw new Error(`Release evidence target identity does not match upstream ${tag}`);
    }
    if (upstreamFromSha !== evidence.from.sha) {
      throw new Error(
        `Release evidence predecessor identity does not match upstream ${evidence.from.tag}`,
      );
    }

    const provenance = provenanceByTag.get(tag);
    if (provenance && (
      provenance.commitSha !== evidence.to.sha ||
      provenance.previousTag !== evidence.from.tag ||
      provenance.previousCommitSha !== evidence.from.sha
    )) {
      throw new Error(`Release evidence contradicts provenance for ${tag}`);
    }
    evidenceByTag.set(tag, evidence);
  }

  for (const tag of completed) {
    if (!exemptions.has(tag) && !evidenceByTag.has(tag)) {
      throw new Error(`Missing required release evidence for ${tag}`);
    }
  }

  return evidenceByTag;
}
