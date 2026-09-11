import fs from 'node:fs/promises';

import {
  collectReleaseEvidence,
  verifyReleaseEvidenceIntegrity,
  writeReleaseEvidenceFile,
} from './release-evidence.mjs';
import {compareReleaseTags} from './release-policy.mjs';

export class ReleaseEvidenceIdentityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReleaseEvidenceIdentityError';
  }
}

function assertAuthoritativeIdentity(evidence, expected) {
  const checks = [
    ['predecessor tag', evidence.from.tag, expected.fromTag],
    ['predecessor SHA', evidence.from.sha, expected.fromSha.toLowerCase()],
    ['target tag', evidence.to.tag, expected.toTag],
    ['target SHA', evidence.to.sha, expected.toSha.toLowerCase()],
  ];

  for (const [label, actual, wanted] of checks) {
    if (actual !== wanted) {
      throw new ReleaseEvidenceIdentityError(
        `Authoritative ${label} is ${actual}, expected ${wanted}`,
      );
    }
  }

  if (!expected.historicalTest) {
    if (compareReleaseTags(evidence.from.tag, evidence.to.tag) >= 0) {
      throw new ReleaseEvidenceIdentityError(
        `Production predecessor ${evidence.from.tag} must precede ${evidence.to.tag}`,
      );
    }
    if (!evidence.comparison.fromIsAncestor) {
      throw new ReleaseEvidenceIdentityError(
        `Production predecessor ${evidence.from.tag} is not an ancestor of ${evidence.to.tag}`,
      );
    }
  }
}

function assertPackageMatches(authoritative, candidate) {
  verifyReleaseEvidenceIntegrity(candidate);

  if (JSON.stringify(candidate) !== JSON.stringify(authoritative)) {
    throw new Error(
      'Release evidence does not match the independently reconstructed Git comparison',
    );
  }
}

async function readEvidenceFile(evidencePath) {
  return JSON.parse(await fs.readFile(evidencePath, 'utf8'));
}

function collectAuthoritative(repositoryDirectory, expected) {
  const evidence = collectReleaseEvidence({
    repositoryDirectory,
    fromTag: expected.fromTag,
    toTag: expected.toTag,
  });
  assertAuthoritativeIdentity(evidence, expected);
  return evidence;
}

export async function verifyOrRebuildReleaseEvidence({
  repositoryDirectory,
  evidencePath,
  fromTag,
  fromSha,
  toTag,
  toSha,
  historicalTest = false,
}) {
  const expected = {
    fromTag,
    fromSha,
    toTag,
    toSha,
    historicalTest,
  };

  // Resolve and validate authoritative Git identity outside the recovery
  // block. A tag/SHA or ancestry failure must never be hidden by rebuilding a
  // derived JSON file.
  const authoritative = collectAuthoritative(repositoryDirectory, expected);

  try {
    const candidate = await readEvidenceFile(evidencePath);
    assertPackageMatches(authoritative, candidate);
    return {evidence: candidate, rebuilt: false, reason: null};
  } catch (error) {
    // Only the derived package is repaired, once. The second collection and
    // comparison below is the bounded post-repair verification pass.
    const reason = error instanceof Error ? error.message : String(error);
    await writeReleaseEvidenceFile(evidencePath, authoritative);

    const reconstructed = collectAuthoritative(repositoryDirectory, expected);
    const candidate = await readEvidenceFile(evidencePath);
    assertPackageMatches(reconstructed, candidate);

    return {evidence: candidate, rebuilt: true, reason};
  }
}
