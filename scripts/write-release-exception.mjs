import fs from 'node:fs/promises';

import {
  classifyReleaseFailure,
  createReleaseException,
} from './release-exception.mjs';
import {writeJsonFile} from './write-json-file.mjs';

const [tag, outputPath, contractLogPath, validationLogPath, contractOutcome,
  validationOutcome, linkOutcome, repairOutcome] = process.argv.slice(2);

async function optionalRead(filePath) {
  if (!filePath || filePath === 'none') return '';
  return fs.readFile(filePath, 'utf8').catch(() => '');
}

async function main() {
  if (!tag || !outputPath || !contractOutcome || !validationOutcome ||
      !linkOutcome || !repairOutcome) {
    throw new Error(
      'Usage: node scripts/write-release-exception.mjs <tag> <output-path> ' +
        '<contract-log|none> <validation-log|none> <contract-outcome> ' +
        '<validation-outcome> <link-outcome> <repair-outcome>',
    );
  }
  const [contractLog, validationLog] = await Promise.all([
    optionalRead(contractLogPath),
    optionalRead(validationLogPath),
  ]);
  const observedState = {
    contract: contractOutcome,
    validation: validationOutcome,
    links: linkOutcome,
    targetedRepair: repairOutcome,
  };
  const failedControl = Object.entries(observedState)
    .filter(([name, outcome]) =>
      name !== 'targetedRepair' && outcome !== 'success',
    )
    .map(([name]) => name);
  const record = createReleaseException({
    tag,
    stage: 'release-documentation-regression-validation',
    expectedState: {
      contract: 'success', validation: 'success', links: 'success',
    },
    observedState,
    failedControl,
    recoveryAttempts: [
      'deterministic Markdown formatting and generated-data refresh',
      `one targeted Copilot repair (${repairOutcome})`,
      'complete regression revalidation',
    ],
    impact: 'Release documentation cannot be accepted automatically.',
    requiredHumanDecision:
      'Determine whether to correct the generated documentation, authoritative evidence, or workflow contract.',
    suggestedActions: [
      'Read the attached contract and validation logs.',
      'Compare the failed claim or structure with the verified tagged source.',
      'Rerun preparation only after correcting the authoritative cause.',
    ],
    responsibleOwner: 'CradleXC release documentation maintainer',
    category: classifyReleaseFailure({contractLog, validationLog, linkOutcome}),
  });
  await writeJsonFile(outputPath, record);
  console.log(`Wrote ${record.category} exception record for ${tag}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
