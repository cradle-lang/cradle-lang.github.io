import fs from 'node:fs/promises';

import {isCommitSha} from './release-identity.mjs';
import {verifyOrRebuildReleaseEvidence} from './release-evidence-control.mjs';

const [
  repositoryDirectory,
  evidencePath,
  fromTag,
  fromSha,
  toTag,
  toSha,
  historicalTestValue,
] = process.argv.slice(2);

async function main() {
  if (
    !repositoryDirectory ||
    !evidencePath ||
    !fromTag ||
    !fromSha ||
    !toTag ||
    !toSha ||
    !historicalTestValue
  ) {
    throw new Error(
      'Usage: node scripts/verify-release-evidence.mjs ' +
        '<repository-directory> <evidence-path> <from-tag> <from-sha> ' +
        '<to-tag> <to-sha> <true|false>',
    );
  }
  if (!isCommitSha(fromSha) || !isCommitSha(toSha)) {
    throw new TypeError('Expected release evidence SHAs must be 40 characters');
  }
  if (!['true', 'false'].includes(historicalTestValue)) {
    throw new TypeError('Historical-test value must be true or false');
  }

  const result = await verifyOrRebuildReleaseEvidence({
    repositoryDirectory,
    evidencePath,
    fromTag,
    fromSha,
    toTag,
    toSha,
    historicalTest: historicalTestValue === 'true',
  });

  const message = result.rebuilt
    ? `Reconstructed and verified release evidence after: ${result.reason}`
    : 'Verified release evidence without reconstruction.';
  console.log(message);

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [
        `path=${evidencePath}`,
        `sha256=${result.evidence.sha256}`,
        `commit_count=${result.evidence.counts.commits}`,
        `file_count=${result.evidence.counts.files}`,
        `rebuilt=${result.rebuilt}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
