import fs from 'node:fs/promises';
import path from 'node:path';

import {isCommitSha} from './release-identity.mjs';
import {compareReleaseTags, parseReleaseTag} from './release-policy.mjs';

export const RELEASE_PROVENANCE_SCHEMA_VERSION = 1;

export function createReleaseProvenance({
  tag,
  commitSha,
  previousTag,
  previousCommitSha,
}) {
  if (!parseReleaseTag(tag) || !parseReleaseTag(previousTag)) {
    throw new TypeError('Release provenance tags must be valid semantic versions');
  }

  if (compareReleaseTags(previousTag, tag) >= 0) {
    throw new Error(`Previous release ${previousTag} must precede ${tag}`);
  }

  if (!isCommitSha(commitSha) || !isCommitSha(previousCommitSha)) {
    throw new TypeError('Release provenance requires full 40-character commit SHAs');
  }

  return {
    schemaVersion: RELEASE_PROVENANCE_SCHEMA_VERSION,
    tag,
    commitSha: commitSha.toLowerCase(),
    previousTag,
    previousCommitSha: previousCommitSha.toLowerCase(),
  };
}

export async function writeReleaseProvenance(
  releaseNotesDirectory,
  values,
) {
  const provenance = createReleaseProvenance(values);
  const provenanceDirectory = path.join(
    releaseNotesDirectory,
    'provenance',
  );
  const outputPath = path.join(
    provenanceDirectory,
    `${provenance.tag}.json`,
  );

  await fs.mkdir(provenanceDirectory, {recursive: true});
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(provenance, null, 2)}\n`,
    'utf8',
  );

  return outputPath;
}

export async function readReleaseProvenance(releaseNotesDirectory) {
  const provenanceDirectory = path.join(
    releaseNotesDirectory,
    'provenance',
  );

  let entries;
  try {
    entries = await fs.readdir(provenanceDirectory, {withFileTypes: true});
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
        const filePath = path.join(provenanceDirectory, entry.name);
        const parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));

        if (parsed.schemaVersion !== RELEASE_PROVENANCE_SCHEMA_VERSION) {
          throw new Error(`Unsupported release provenance schema in ${filePath}`);
        }

        const provenance = createReleaseProvenance(parsed);
        if (entry.name !== `${provenance.tag}.json`) {
          throw new Error(`Release provenance filename does not match ${provenance.tag}`);
        }

        return provenance;
      }),
  );
}

export function verifyCompletedReleaseProvenance({
  completedTags,
  upstreamReleases,
  provenanceRecords,
  exemptTags = [],
}) {
  const completed = new Set(completedTags);
  const exemptions = new Set(exemptTags);
  const upstreamByTag = new Map(
    upstreamReleases.map(({tag, sha}) => [tag, sha.toLowerCase()]),
  );
  const provenanceByTag = new Map();

  for (const provenance of provenanceRecords) {
    if (provenanceByTag.has(provenance.tag)) {
      throw new Error(`Duplicate release provenance for ${provenance.tag}`);
    }
    if (!completed.has(provenance.tag)) {
      throw new Error(`Release provenance exists without a completed note for ${provenance.tag}`);
    }
    provenanceByTag.set(provenance.tag, provenance);
  }

  for (const tag of completed) {
    if (exemptions.has(tag)) {
      continue;
    }

    const provenance = provenanceByTag.get(tag);
    if (!provenance) {
      throw new Error(`Missing required release provenance for ${tag}`);
    }

    const currentSha = upstreamByTag.get(tag);
    if (!currentSha) {
      throw new Error(`Completed release ${tag} is missing from the upstream inventory`);
    }
    if (currentSha !== provenance.commitSha) {
      throw new Error(`Completed upstream tag ${tag} moved after documentation`);
    }

    const currentPreviousSha = upstreamByTag.get(provenance.previousTag);
    if (!currentPreviousSha) {
      throw new Error(
        `Previous tag ${provenance.previousTag} is missing from the upstream inventory`,
      );
    }
    if (currentPreviousSha !== provenance.previousCommitSha) {
      throw new Error(
        `Previous upstream tag ${provenance.previousTag} moved after documentation`,
      );
    }
  }
}
