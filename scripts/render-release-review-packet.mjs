import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';

import {createReleaseReviewPacket} from './release-review-packet.mjs';

const [templatePath, evidencePath, preworkPath, bodyPath] = process.argv.slice(2);

function changedPaths() {
  const tracked = execFileSync(
    'git',
    ['diff', '--name-only', 'HEAD'],
    {encoding: 'utf8'},
  );
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    {encoding: 'utf8'},
  );
  return [...new Set(`${tracked}\n${untracked}`.trim().split('\n'))]
    .filter((path) => path && !path.startsWith('upstream-cradlexc/'))
    .sort();
}

async function main() {
  if (!templatePath || !evidencePath || !preworkPath || !bodyPath) {
    throw new Error(
      'Usage: node scripts/render-release-review-packet.mjs ' +
        '<template> <evidence-json> <prework-json> <body-output>',
    );
  }
  const [template, evidence, prework] = await Promise.all([
    fs.readFile(templatePath, 'utf8'),
    fs.readFile(evidencePath, 'utf8').then(JSON.parse),
    fs.readFile(preworkPath, 'utf8').then(JSON.parse),
  ]);
  const packet = createReleaseReviewPacket({
    template,
    tag: process.env.RELEASE_TAG,
    expectedSha: process.env.EXPECTED_SHA,
    historicalTest: process.env.HISTORICAL_TEST === 'true',
    archivedVersion: process.env.ARCHIVED_VERSION || 'none',
    evidence,
    prework,
    changedPaths: changedPaths(),
    results: {
      contractsFirst: process.env.CONTRACTS_FIRST,
      contractsSecond: process.env.CONTRACTS_SECOND,
      validationFirst: process.env.VALIDATION_FIRST,
      validationSecond: process.env.VALIDATION_SECOND,
      linksFirst: process.env.LINKS_FIRST,
      linksSecond: process.env.LINKS_SECOND,
      repair: process.env.REPAIR_OUTCOME,
    },
    evidenceRebuilt: process.env.EVIDENCE_REBUILT,
    doctor: {
      exitCode: process.env.DOCTOR_EXIT_CODE,
      dependencyCount: process.env.DOCTOR_DEPENDENCY_COUNT,
      sha256: process.env.DOCTOR_CAPTURE_SHA256,
    },
    context: {
      upstreamFiles: process.env.CONTEXT_UPSTREAM_FILES,
      documentationFiles: process.env.CONTEXT_DOCUMENTATION_FILES,
      sha256: process.env.CONTEXT_SHA256,
    },
  });

  await fs.writeFile(bodyPath, packet.body, 'utf8');
  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [
        `title=${packet.title}`,
        `draft=${packet.isDraft}`,
        `ai_calls=${packet.aiCalls}`,
        `body_path=${bodyPath}`,
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
