import fs from 'node:fs/promises';

import {createPublicationOperationsMetrics} from './release-operations-metrics.mjs';
import {writeJsonFile} from './write-json-file.mjs';

const [releaseListPath, pullRequestsPath, outputPath] = process.argv.slice(2);

async function main() {
  if (!releaseListPath || !pullRequestsPath || !outputPath) {
    throw new Error(
      'Usage: node scripts/write-release-publication-metrics.mjs ' +
        '<release-list> <pull-requests-json> <output-json>',
    );
  }
  const [releaseList, pullRequests] = await Promise.all([
    fs.readFile(releaseListPath, 'utf8'),
    fs.readFile(pullRequestsPath, 'utf8').then(JSON.parse).catch(() => []),
  ]);
  const releases = releaseList
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((note) => note.split('/').at(-1).replace(/\.md$/u, ''));
  const metrics = createPublicationOperationsMetrics({
    releases,
    pullRequests: Array.isArray(pullRequests) ? pullRequests : [],
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    startedAt: process.env.PUBLICATION_STARTED_AT,
    finishedAt: new Date().toISOString(),
    publishOutcome: process.env.PUBLISH_OUTCOME,
  });
  await writeJsonFile(outputPath, metrics);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const reviewLines = metrics.reviews.map(({release, reviewDurationSeconds}) =>
      `- ${release} review duration: ${reviewDurationSeconds ?? 'not available'} seconds`,
    );
    await fs.appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '## Release publication metrics',
        '',
        `- Result: \`${metrics.result}\``,
        `- Publication workflow duration: ${metrics.timing.durationSeconds} seconds`,
        ...reviewLines,
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
