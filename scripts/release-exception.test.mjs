import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyReleaseFailure,
  createReleaseException,
} from './release-exception.mjs';

test('classifies governance, transient, deterministic and semantic failures', () => {
  assert.equal(classifyReleaseFailure({contractLog: 'Disallowed path: package.json'}), 'INTEGRITY_GOVERNANCE');
  assert.equal(classifyReleaseFailure({validationLog: 'network timeout'}), 'TRANSIENT_INFRASTRUCTURE');
  assert.equal(classifyReleaseFailure({validationLog: 'markdownlint MD013'}), 'DETERMINISTIC_RECOVERABLE');
  assert.equal(classifyReleaseFailure({validationLog: 'unsupported claim'}), 'SEMANTIC_RECOVERABLE');
});

test('creates a deterministic, checksummed BLOCKED exception record', () => {
  const input = {
    tag: 'v0.19.0', stage: 'validation', category: 'SEMANTIC_RECOVERABLE',
    expectedState: {contract: 'success'}, observedState: {contract: 'failure'},
    failedControl: ['contract'], recoveryAttempts: ['targeted repair'],
    impact: 'Cannot publish.', requiredHumanDecision: 'Review claim.',
    suggestedActions: ['Inspect evidence.'], responsibleOwner: 'Maintainer',
  };
  const first = createReleaseException(input);
  const second = createReleaseException(input);
  assert.equal(first.state, 'BLOCKED');
  assert.equal(first.sha256, second.sha256);
});
