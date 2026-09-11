import fs from 'node:fs/promises';

import {verifyReleaseIdentity} from './release-identity.mjs';

const [tag, expectedSha, resolvedSha, checkedOutSha, historicalTestValue] =
  process.argv.slice(2);

async function main() {
  if (!tag || !resolvedSha || !checkedOutSha) {
    throw new Error(
      'Usage: node scripts/check-release-identity.mjs ' +
        '<tag> <expected-sha-or-empty> <resolved-sha> <checked-out-sha> ' +
        '<true|false>',
    );
  }

  if (!['true', 'false'].includes(historicalTestValue)) {
    throw new TypeError('Historical-test value must be true or false');
  }

  const identity = verifyReleaseIdentity({
    tag,
    expectedSha,
    resolvedSha,
    checkedOutSha,
    historicalTest: historicalTestValue === 'true',
  });

  console.log(`Verified ${identity.tag} at commit ${identity.commitSha}.`);

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `sha=${identity.commitSha}\n`,
      'utf8',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
