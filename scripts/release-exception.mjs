import crypto from 'node:crypto';

export const RELEASE_EXCEPTION_SCHEMA_VERSION = 1;

function payloadOf(record) {
  const {sha256: _sha256, ...payload} = record;
  return payload;
}

export function calculateReleaseExceptionSha256(record) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payloadOf(record)))
    .digest('hex');
}

export function classifyReleaseFailure({contractLog = '', validationLog = '', linkOutcome}) {
  const text = `${contractLog}\n${validationLog}`;
  if (/disallowed path|historical-terminal|archived terminal|checksum|identity|SHA|tag.*match/i.test(text)) {
    return 'INTEGRITY_GOVERNANCE';
  }
  if (/timeout|timed out|network|ECONN|rate limit|HTTP 5\d\d/i.test(text) || linkOutcome === 'cancelled') {
    return 'TRANSIENT_INFRASTRUCTURE';
  }
  if (/markdownlint|format|generated metadata/i.test(text)) {
    return 'DETERMINISTIC_RECOVERABLE';
  }
  return 'SEMANTIC_RECOVERABLE';
}

export function createReleaseException({
  tag,
  stage,
  expectedState,
  observedState,
  failedControl,
  recoveryAttempts,
  impact,
  requiredHumanDecision,
  suggestedActions,
  responsibleOwner,
  category,
}) {
  const payload = {
    schemaVersion: RELEASE_EXCEPTION_SCHEMA_VERSION,
    release: tag,
    state: 'BLOCKED',
    stage,
    category,
    expectedState,
    observedState,
    failedControl,
    recoveryAttempts,
    impact,
    requiredHumanDecision,
    suggestedActions,
    responsibleOwner,
  };
  return {...payload, sha256: calculateReleaseExceptionSha256(payload)};
}
