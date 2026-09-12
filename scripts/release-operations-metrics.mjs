import crypto from 'node:crypto';

import {
  preparationLifecycleState,
  publicationLifecycleState,
} from './release-lifecycle.mjs';

export const RELEASE_OPERATIONS_METRICS_SCHEMA_VERSION = 1;

function timestamp(value, name) {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) {
    throw new TypeError(`${name} must be an ISO-8601 timestamp.`);
  }
  return milliseconds;
}

function nonNegativeInteger(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new TypeError(`${name} must be a non-negative integer.`);
  }
  return number;
}

function stepRan(outcome) {
  return ['success', 'failure', 'cancelled'].includes(outcome);
}

export function calculateReleaseOperationsMetricsSha256(metrics) {
  const {sha256: _sha256, ...payload} = metrics;
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function withChecksum(payload) {
  return {
    ...payload,
    sha256: calculateReleaseOperationsMetricsSha256(payload),
  };
}

export function verifyReleaseOperationsMetrics(metrics) {
  if (metrics?.schemaVersion !== RELEASE_OPERATIONS_METRICS_SCHEMA_VERSION) {
    throw new Error(`Unsupported release operations metrics schema: ${metrics?.schemaVersion}`);
  }
  if (metrics.sha256 !== calculateReleaseOperationsMetricsSha256(metrics)) {
    throw new Error('Release operations metrics checksum does not match its contents.');
  }
  return metrics;
}

export function createPreparationOperationsMetrics({
  tag,
  historicalTest,
  runId,
  runAttempt,
  queueObservedAt,
  startedAt,
  finishedAt,
  classification,
  evidenceRebuilt,
  context,
  generationOutcome,
  repairOutcome,
  validation,
  exceptionRequired,
  pullRequestCreated,
  limits,
}) {
  const startedMilliseconds = timestamp(startedAt, 'Preparation start');
  const finishedMilliseconds = timestamp(finishedAt, 'Preparation finish');
  if (finishedMilliseconds < startedMilliseconds) {
    throw new Error('Preparation finish cannot precede its start.');
  }
  const observedMilliseconds = queueObservedAt
    ? timestamp(queueObservedAt, 'Queue observation')
    : null;
  const generationCalls = stepRan(generationOutcome) ? 1 : 0;
  const repairCalls = stepRan(repairOutcome) ? 1 : 0;
  const normalizedLimits = {
    productionWip: nonNegativeInteger(limits.productionWip, 'Production WIP limit'),
    repairAttempts: nonNegativeInteger(limits.repairAttempts, 'Repair-attempt limit'),
    initialAiCredits: nonNegativeInteger(limits.initialAiCredits, 'Initial AI-credit limit'),
    repairAiCredits: nonNegativeInteger(limits.repairAiCredits, 'Repair AI-credit limit'),
  };

  return withChecksum({
    schemaVersion: RELEASE_OPERATIONS_METRICS_SCHEMA_VERSION,
    kind: 'release-preparation',
    release: tag,
    historicalTest,
    workflow: {runId: String(runId), runAttempt: String(runAttempt)},
    timing: {
      queueObservedAt: queueObservedAt || null,
      startedAt,
      finishedAt,
      durationSeconds: Math.round((finishedMilliseconds - startedMilliseconds) / 1000),
      dispatchLatencySeconds: observedMilliseconds === null
        ? null
        : Math.max(0, Math.round((startedMilliseconds - observedMilliseconds) / 1000)),
    },
    releaseShape: {
      classification: classification || 'unknown',
      evidenceRebuilt: evidenceRebuilt === 'true',
    },
    context: {
      bytes: nonNegativeInteger(context.bytes, 'AI context byte count'),
      upstreamFiles: nonNegativeInteger(context.upstreamFiles, 'Upstream context file count'),
      documentationFiles: nonNegativeInteger(
        context.documentationFiles,
        'Documentation context file count',
      ),
    },
    ai: {
      generationOutcome: generationOutcome || 'skipped',
      repairOutcome: repairOutcome || 'skipped',
      generationCalls,
      repairCalls,
      totalCalls: generationCalls + repairCalls,
      maximumCreditsAuthorized:
        generationCalls * normalizedLimits.initialAiCredits +
        repairCalls * normalizedLimits.repairAiCredits,
    },
    validation: {...validation},
    controls: normalizedLimits,
    result: preparationLifecycleState({exceptionRequired, pullRequestCreated}),
  });
}

export function createPublicationOperationsMetrics({
  releases,
  pullRequests,
  runId,
  runAttempt,
  startedAt,
  finishedAt,
  publishOutcome,
}) {
  const startedMilliseconds = timestamp(startedAt, 'Publication start');
  const finishedMilliseconds = timestamp(finishedAt, 'Publication finish');
  if (finishedMilliseconds < startedMilliseconds) {
    throw new Error('Publication finish cannot precede its start.');
  }
  const reviews = releases.map((tag) => {
    const pullRequest = pullRequests.find(({head}) => head?.ref === `release/${tag}`);
    const created = pullRequest?.created_at ? Date.parse(pullRequest.created_at) : NaN;
    const merged = pullRequest?.merged_at ? Date.parse(pullRequest.merged_at) : NaN;
    return {
      release: tag,
      pullRequest: pullRequest?.number ?? null,
      reviewDurationSeconds: Number.isFinite(created) && Number.isFinite(merged)
        ? Math.max(0, Math.round((merged - created) / 1000))
        : null,
    };
  });

  return withChecksum({
    schemaVersion: RELEASE_OPERATIONS_METRICS_SCHEMA_VERSION,
    kind: 'release-publication',
    releases,
    workflow: {runId: String(runId), runAttempt: String(runAttempt)},
    timing: {
      startedAt,
      finishedAt,
      durationSeconds: Math.round((finishedMilliseconds - startedMilliseconds) / 1000),
    },
    reviews,
    publishOutcome,
    result: publicationLifecycleState({publishOutcome}),
  });
}
