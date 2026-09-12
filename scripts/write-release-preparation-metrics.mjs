import fs from 'node:fs/promises';

import {createPreparationOperationsMetrics} from './release-operations-metrics.mjs';
import {writeJsonFile} from './write-json-file.mjs';

const [outputPath, contextPath] = process.argv.slice(2);

async function main() {
  if (!outputPath) {
    throw new Error(
      'Usage: node scripts/write-release-preparation-metrics.mjs ' +
        '<output-json> [context-json]',
    );
  }
  const contextBytes = contextPath
    ? await fs.stat(contextPath).then(({size}) => size).catch(() => 0)
    : 0;
  const metrics = createPreparationOperationsMetrics({
    tag: process.env.RELEASE_TAG,
    historicalTest: process.env.HISTORICAL_TEST === 'true',
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    queueObservedAt: process.env.QUEUE_OBSERVED_AT,
    startedAt: process.env.PREPARATION_STARTED_AT,
    finishedAt: new Date().toISOString(),
    classification: process.env.IMPACT_CLASSIFICATION,
    evidenceRebuilt: process.env.EVIDENCE_REBUILT,
    context: {
      bytes: contextBytes,
      upstreamFiles: process.env.CONTEXT_UPSTREAM_FILES || 0,
      documentationFiles: process.env.CONTEXT_DOCUMENTATION_FILES || 0,
    },
    generationOutcome: process.env.GENERATION_OUTCOME,
    repairOutcome: process.env.REPAIR_OUTCOME,
    validation: {
      contractsFirst: process.env.CONTRACTS_FIRST || 'skipped',
      contractsSecond: process.env.CONTRACTS_SECOND || 'skipped',
      documentationFirst: process.env.VALIDATION_FIRST || 'skipped',
      documentationSecond: process.env.VALIDATION_SECOND || 'skipped',
      linksFirst: process.env.LINKS_FIRST || 'skipped',
      linksSecond: process.env.LINKS_SECOND || 'skipped',
    },
    exceptionRequired:
      process.env.EXCEPTION_REQUIRED === 'true' ||
      process.env.PULL_REQUEST_OUTCOME !== 'success',
    pullRequestCreated: process.env.PULL_REQUEST_OUTCOME === 'success',
    limits: {
      productionWip: process.env.PRODUCTION_WIP_LIMIT,
      repairAttempts: process.env.REPAIR_ATTEMPT_LIMIT,
      initialAiCredits: process.env.INITIAL_AI_CREDIT_LIMIT,
      repairAiCredits: process.env.REPAIR_AI_CREDIT_LIMIT,
    },
  });
  await writeJsonFile(outputPath, metrics);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '## Release operations metrics',
        '',
        `- Result: \`${metrics.result}\``,
        `- Workflow duration: ${metrics.timing.durationSeconds} seconds`,
        `- Dispatch latency: ${metrics.timing.dispatchLatencySeconds ?? 'not available'} seconds`,
        `- AI calls: ${metrics.ai.totalCalls}`,
        `- Maximum AI credits authorized: ${metrics.ai.maximumCreditsAuthorized}`,
        `- Bounded context size: ${metrics.context.bytes} bytes`,
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
