import assert from 'node:assert/strict';
import test from 'node:test';

import {createEscalationIssue} from './release-escalation-issue.mjs';

test('renders a professional, actionable, idempotent production issue', () => {
  const issue = createEscalationIssue({
    tag: 'v0.19.0',
    expectedSha: '1'.repeat(40),
    repository: 'cradle-lang/cradle-dsl.github.io',
    workflowName: 'Prepare CradleXC release documentation with Copilot',
    runId: '12345',
    runAttempt: '2',
    runUrl: 'https://github.com/cradle-lang/cradle-dsl.github.io/actions/runs/12345',
    jobs: [{
      name: 'prepare',
      conclusion: 'failure',
      steps: [
        {name: 'Build CradleXC and capture cxc doctor', conclusion: 'failure'},
      ],
    }],
  });

  assert.equal(issue.title, '[Release automation blocked] CradleXC v0.19.0');
  assert.equal(issue.category, 'DETERMINISTIC_RECOVERABLE');
  assert.match(issue.body, /<!-- cradlexc-release-escalation:v0\.19\.0 -->/);
  assert.match(issue.body, /## Impact/);
  assert.match(issue.body, /Build CradleXC and capture cxc doctor/);
  assert.match(issue.body, /scripts\/run-release-doctor\.mjs/);
  assert.match(issue.body, /Required maintainer decision/);
  assert.match(issue.body, /attempt 2/);
  assert.doesNotMatch(issue.body, /undefined|null/);
});

test('uses a structured exception to describe exhausted recovery', () => {
  const issue = createEscalationIssue({
    tag: 'v0.20.0',
    expectedSha: '2'.repeat(40),
    repository: 'example/docs',
    workflowName: 'Prepare release',
    runId: '99',
    runAttempt: '1',
    runUrl: 'https://github.com/example/docs/actions/runs/99',
    jobs: [{
      name: 'prepare',
      conclusion: 'failure',
      steps: [{name: 'Enforce release preparation outcome', conclusion: 'failure'}],
    }],
    exception: {
      category: 'SEMANTIC_RECOVERABLE',
      expectedState: {contract: 'success'},
      observedState: {contract: 'failure'},
      recoveryAttempts: ['Formatted Markdown', 'Ran one targeted repair'],
      impact: 'Documentation remains technically inconsistent.',
      requiredHumanDecision: 'Confirm the documented default.',
      suggestedActions: ['Compare the default with tagged source.'],
      responsibleOwner: 'Documentation maintainer',
    },
  });

  assert.match(issue.body, /Documentation remains technically inconsistent/);
  assert.match(issue.body, /Ran one targeted repair/);
  assert.match(issue.body, /Confirm the documented default/);
  assert.match(issue.body, /Documentation maintainer/);
});
