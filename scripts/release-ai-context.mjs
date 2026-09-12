import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import {verifyReleaseEvidenceIntegrity} from './release-evidence.mjs';
import {verifyReleaseDoctorIntegrity} from './release-doctor.mjs';
import {verifyReleasePreworkIntegrity} from './release-prework.mjs';

export const RELEASE_AI_CONTEXT_SCHEMA_VERSION = 1;
const MAX_FILE_CHARACTERS = 20_000;

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

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

function boundedContent(content) {
  if (content.length <= MAX_FILE_CHARACTERS) {
    return {content, truncated: false};
  }
  return {
    content: content.slice(0, MAX_FILE_CHARACTERS),
    truncated: true,
  };
}

function readGitFile(repositoryDirectory, revision, filePath) {
  try {
    return boundedContent(
      runGit(repositoryDirectory, ['show', `${revision}:${filePath}`]),
    );
  } catch {
    return null;
  }
}

function contextPayload(context) {
  const {sha256: _sha256, ...payload} = context;
  return payload;
}

export function calculateReleaseAiContextSha256(context) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(contextPayload(context)))
    .digest('hex');
}

export function createReleaseAiContext({
  evidence,
  prework,
  doctorCapture,
  previousReleaseNote,
  upstreamFiles,
  documentationFiles,
}) {
  verifyReleaseEvidenceIntegrity(evidence);
  verifyReleasePreworkIntegrity(prework);
  verifyReleaseDoctorIntegrity(doctorCapture);
  if (prework.evidenceSha256 !== evidence.sha256) {
    throw new Error('AI context prework does not match its release evidence');
  }
  if (
    doctorCapture.release.tag !== evidence.to.tag ||
    doctorCapture.release.sha !== evidence.to.sha
  ) {
    throw new Error('AI context doctor capture does not match its release evidence');
  }

  const payload = {
    schemaVersion: RELEASE_AI_CONTEXT_SCHEMA_VERSION,
    release: {...evidence.to},
    previous: {...evidence.from},
    evidence,
    prework,
    doctorCapture,
    previousReleaseNote,
    upstreamFiles,
    documentationFiles,
    limits: {
      maximumFileCharacters: MAX_FILE_CHARACTERS,
    },
  };
  return {
    ...payload,
    sha256: calculateReleaseAiContextSha256(payload),
  };
}

export async function buildReleaseAiContext({
  repositoryDirectory,
  evidence,
  prework,
  doctorCapture,
  previousReleaseNotePath,
}) {
  const relevantPaths = [...new Set([
    ...prework.inventory.sourceFiles,
    ...prework.inventory.testFiles,
    ...prework.inventory.cliFiles,
    ...prework.inventory.configurationFiles,
    ...prework.inventory.schemaFiles,
  ])].sort(compareText);
  const evidenceByPath = new Map(
    evidence.files.flatMap((file) => [
      [file.path, file],
      ...(file.oldPath ? [[file.oldPath, file]] : []),
    ]),
  );
  const upstreamFiles = relevantPaths.map((filePath) => {
    const file = evidenceByPath.get(filePath);
    return {
      path: filePath,
      status: file?.status ?? 'related',
      before: readGitFile(repositoryDirectory, evidence.from.sha, filePath),
      after: readGitFile(repositoryDirectory, evidence.to.sha, filePath),
    };
  });
  const documentationFiles = await Promise.all(
    prework.likelyDocumentation
      .map(async ({path: filePath, matchedTerms}) => ({
        path: filePath,
        matchedTerms,
        ...boundedContent(await fs.readFile(filePath, 'utf8')),
      })),
  );
  const previousReleaseNote = {
    path: previousReleaseNotePath,
    ...boundedContent(await fs.readFile(previousReleaseNotePath, 'utf8')),
  };

  return createReleaseAiContext({
    evidence,
    prework,
    doctorCapture,
    previousReleaseNote,
    upstreamFiles,
    documentationFiles,
  });
}

export async function writeReleaseAiContext(outputPath, context) {
  if (context.sha256 !== calculateReleaseAiContextSha256(context)) {
    throw new Error('Release AI context checksum does not match its contents');
  }
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(context, null, 2)}\n`,
    'utf8',
  );
  return outputPath;
}
