import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {calculateReleasePreworkSha256} from './release-prework.mjs';
import {
  planReleaseReviewRouting,
  validateReleaseReviewRoutingPolicy,
} from './release-review-routing.mjs';

const policy = await fs.readFile(
  new URL('../config/release-review-routing.json', import.meta.url),
  'utf8',
).then(JSON.parse);

function preworkFixture() {
  const payload = {
    schemaVersion: 1,
    release: {tag: 'v0.19.0', sha: '2'.repeat(40)},
    previous: {tag: 'v0.18.1', sha: '1'.repeat(40)},
    evidenceSha256: 'a'.repeat(64),
    inventory: {},
    signals: {},
    likelyDocumentation: [],
    riskIndicators: ['possible-breaking-change', 'removed-cli-flag'],
    classification: {
      level: 'COMPLEX_USER_FACING',
      requiresUserDocumentation: true,
      reasons: ['CLI and configuration behavior changed.'],
      domains: ['cli', 'configuration'],
      possibleBreakingChange: true,
    },
  };
  return {...payload, sha256: calculateReleasePreworkSha256(payload)};
}

test('routes affected domains to parallel specialist review lanes', () => {
  const plan = planReleaseReviewRouting({policy, prework: preworkFixture()});

  assert.deepEqual(plan.lanes, [
    'Breaking-change and migration review',
    'CLI technical review',
    'Configuration technical review',
    'Documentation review',
  ]);
  assert.deepEqual(plan.labels.map(({name}) => name), [
    'review:cli',
    'review:compatibility',
    'review:configuration',
    'review:documentation',
  ]);
  assert.equal(
    plan.labels.filter(({name}) => name === 'review:compatibility').length,
    1,
  );
});

test('supports configured reviewers but suppresses notifications for historical tests', () => {
  const configured = structuredClone(policy);
  configured.domains.cli.reviewers = ['cradle-lang/cli-maintainers'];

  const production = planReleaseReviewRouting({
    policy: configured,
    prework: preworkFixture(),
  });
  assert.deepEqual(production.reviewers, ['cradle-lang/cli-maintainers']);

  const historical = planReleaseReviewRouting({
    policy: configured,
    prework: preworkFixture(),
    historicalTest: true,
  });
  assert.deepEqual(historical.reviewers, []);
  assert.equal(historical.reviewerNotificationsSuppressed, true);
});

test('rejects malformed routing policy values', () => {
  const malformed = structuredClone(policy);
  malformed.base.labels[0].color = 'green';
  assert.throws(
    () => validateReleaseReviewRoutingPolicy(malformed),
    /six-digit color/,
  );
});
