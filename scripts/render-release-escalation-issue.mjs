import fs from 'node:fs/promises';

import {createEscalationIssue} from './release-escalation-issue.mjs';

const [runPath, exceptionPath, bodyPath] = process.argv.slice(2);

async function main() {
  if (!runPath || !exceptionPath || !bodyPath) {
    throw new Error(
      'Usage: node scripts/render-release-escalation-issue.mjs ' +
        '<run-json> <exception-json|none> <body-output>',
    );
  }
  const run = JSON.parse(await fs.readFile(runPath, 'utf8'));
  const exception = exceptionPath === 'none'
    ? null
    : await fs.readFile(exceptionPath, 'utf8').then(JSON.parse).catch(() => null);
  const issue = createEscalationIssue({
    tag: process.env.RELEASE_TAG,
    expectedSha: process.env.EXPECTED_SHA,
    repository: process.env.GITHUB_REPOSITORY,
    workflowName: process.env.GITHUB_WORKFLOW,
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    runUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    jobs: run.jobs ?? [],
    exception,
  });
  await fs.writeFile(bodyPath, issue.body, 'utf8');
  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [`title=${issue.title}`, `marker=${issue.marker}`, `category=${issue.category}`, ''].join('\n'),
      'utf8',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
