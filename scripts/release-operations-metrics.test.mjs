import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPreparationOperationsMetrics,
  createPublicationOperationsMetrics,
  verifyReleaseOperationsMetrics,
} from './release-operations-metrics.mjs';

test('records preparation time, bounded context, AI usage, and controls', () => {
  const metrics = createPreparationOperationsMetrics({
    tag: 'v0.19.0', historicalTest: false, runId: '10', runAttempt: '1',
    queueObservedAt: '2026-09-12T00:00:00.000Z',
    startedAt: '2026-09-12T00:00:05.000Z',
    finishedAt: '2026-09-12T00:02:05.000Z',
    classification: 'SMALL_USER_FACING', evidenceRebuilt: 'false',
    context: {bytes: 4096, upstreamFiles: 2, documentationFiles: 3},
    generationOutcome: 'success', repairOutcome: 'skipped',
    validation: {contractsFirst: 'success'},
    exceptionRequired: false, pullRequestCreated: true,
    limits: {
      productionWip: 1, repairAttempts: 1,
      initialAiCredits: 60, repairAiCredits: 20,
    },
  });

  assert.equal(metrics.timing.durationSeconds, 120);
  assert.equal(metrics.timing.dispatchLatencySeconds, 5);
  assert.equal(metrics.ai.totalCalls, 1);
  assert.equal(metrics.ai.maximumCreditsAuthorized, 60);
  assert.equal(metrics.context.bytes, 4096);
  assert.equal(metrics.controls.productionWip, 1);
  assert.equal(metrics.result, 'PR_OPEN');
  assert.match(metrics.sha256, /^[0-9a-f]{64}$/u);
  assert.equal(verifyReleaseOperationsMetrics(metrics), metrics);
});

test('records a failed repair as a second bounded AI call and BLOCKED result', () => {
  const metrics = createPreparationOperationsMetrics({
    tag: 'v0.20.0', historicalTest: false, runId: '11', runAttempt: '2',
    queueObservedAt: '', startedAt: '2026-09-12T00:00:00.000Z',
    finishedAt: '2026-09-12T00:03:00.000Z', classification: 'COMPLEX_USER_FACING',
    evidenceRebuilt: 'true', context: {bytes: 8192, upstreamFiles: 5, documentationFiles: 6},
    generationOutcome: 'success', repairOutcome: 'failure', validation: {},
    exceptionRequired: true, pullRequestCreated: false,
    limits: {
      productionWip: 1, repairAttempts: 1,
      initialAiCredits: 60, repairAiCredits: 20,
    },
  });

  assert.equal(metrics.ai.totalCalls, 2);
  assert.equal(metrics.ai.maximumCreditsAuthorized, 80);
  assert.equal(metrics.result, 'BLOCKED');
  assert.equal(metrics.timing.dispatchLatencySeconds, null);
});

test('records review and publication duration independently', () => {
  const metrics = createPublicationOperationsMetrics({
    releases: ['v0.19.0'], runId: '12', runAttempt: '1',
    startedAt: '2026-09-12T01:00:00.000Z',
    finishedAt: '2026-09-12T01:00:30.000Z', publishOutcome: 'success',
    pullRequests: [{
      number: 42,
      head: {ref: 'release/v0.19.0'},
      created_at: '2026-09-11T00:00:00.000Z',
      merged_at: '2026-09-12T00:00:00.000Z',
    }],
  });

  assert.equal(metrics.timing.durationSeconds, 30);
  assert.equal(metrics.reviews[0].reviewDurationSeconds, 86400);
  assert.equal(metrics.result, 'COMPLETED');
});

test('detects a modified operations record', () => {
  const metrics = createPublicationOperationsMetrics({
    releases: ['v0.19.0'], pullRequests: [], runId: '13', runAttempt: '1',
    startedAt: '2026-09-12T01:00:00.000Z',
    finishedAt: '2026-09-12T01:00:30.000Z', publishOutcome: 'success',
  });
  metrics.publishOutcome = 'failure';
  assert.throws(() => verifyReleaseOperationsMetrics(metrics), /checksum/);
});
