import fs from 'node:fs/promises';

import {checkReleaseJitReadiness} from './release-jit.mjs';

const [
  releaseNotesDirectory,
  tag,
  previousTag,
  evidencePath,
  preworkPath,
  doctorCapturePath,
  currentMainSha,
  latestMainSha,
  blockingPullRequestCountValue,
  historicalTestValue,
] = process.argv.slice(2);

async function main() {
  if (
    !releaseNotesDirectory ||
    !tag ||
    !previousTag ||
    !evidencePath ||
    !preworkPath ||
    !doctorCapturePath ||
    !currentMainSha ||
    !latestMainSha ||
    blockingPullRequestCountValue === undefined ||
    !historicalTestValue
  ) {
    throw new Error(
      'Usage: node scripts/check-release-jit-readiness.mjs ' +
        '<release-notes-directory> <tag> <previous-tag> <evidence-path> ' +
        '<prework-path> <doctor-capture-path> <current-main-sha> <latest-main-sha> ' +
        '<blocking-pr-count> <true|false>',
    );
  }
  if (!['true', 'false'].includes(historicalTestValue)) {
    throw new TypeError('Historical-test value must be true or false');
  }

  const readiness = await checkReleaseJitReadiness({
    releaseNotesDirectory,
    tag,
    previousTag,
    evidencePath,
    preworkPath,
    doctorCapturePath,
    currentMainSha,
    latestMainSha,
    blockingPullRequestCount: Number(blockingPullRequestCountValue),
    historicalTest: historicalTestValue === 'true',
  });
  console.log(
    `${readiness.tag} is ${readiness.state} for JIT generation ` +
      `(${readiness.classification}).`,
  );

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [
        `state=${readiness.state}`,
        `classification=${readiness.classification}`,
        `requires_documentation=${readiness.requiresUserDocumentation}`,
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
