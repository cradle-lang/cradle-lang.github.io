import fs from 'node:fs/promises';

import {planReleaseReviewRouting} from './release-review-routing.mjs';
import {writeJsonFile} from './write-json-file.mjs';

const [policyPath, preworkPath, outputPath] = process.argv.slice(2);

async function main() {
  if (!policyPath || !preworkPath || !outputPath) {
    throw new Error(
      'Usage: node scripts/plan-release-review-routing.mjs ' +
        '<policy-json> <prework-json> <output-json>',
    );
  }
  const [policy, prework] = await Promise.all([
    fs.readFile(policyPath, 'utf8').then(JSON.parse),
    fs.readFile(preworkPath, 'utf8').then(JSON.parse),
  ]);
  const plan = planReleaseReviewRouting({
    policy,
    prework,
    historicalTest: process.env.HISTORICAL_TEST === 'true',
  });
  await writeJsonFile(outputPath, plan);

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [`path=${outputPath}`, `lane_count=${plan.lanes.length}`, ''].join('\n'),
      'utf8',
    );
  }
  console.log(
    `Planned ${plan.lanes.length} review lane(s), ${plan.labels.length} label(s), ` +
      `and ${plan.reviewers.length} reviewer request(s) for ${plan.release}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
