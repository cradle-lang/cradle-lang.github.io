import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compareReleaseTags,
  isHistoricalTestRelease,
  isProductionRelease,
  parseReleaseTag,
  releasePolicy,
} from './release-policy.mjs';

test('loads the expected production floor', () => {
  assert.equal(releasePolicy.minimumProductionTag, 'v0.18.1');
  assert.equal(releasePolicy.includePrereleases, false);
  assert.deepEqual(releasePolicy.provenanceExemptTags, ['v0.18.1']);
});

test('accepts stable releases at or above v0.18.1 for production', () => {
  assert.equal(isProductionRelease('v0.18.1'), true);
  assert.equal(isProductionRelease('v0.19.0'), true);
  assert.equal(isProductionRelease('v1.0.0'), true);
});

test('rejects stable releases below v0.18.1 for production', () => {
  assert.equal(isProductionRelease('v0.18.0'), false);
  assert.equal(isProductionRelease('v0.17.9'), false);
});

test('allows older valid tags only as historical tests', () => {
  assert.equal(isHistoricalTestRelease('v0.16.0'), true);
  assert.equal(isProductionRelease('v0.16.0'), false);
});

test('excludes prereleases from production under the current policy', () => {
  assert.equal(isProductionRelease('v0.19.0-alpha.1'), false);
  assert.equal(isHistoricalTestRelease('v0.19.0-alpha.1'), true);
});

test('rejects malformed semantic versions', () => {
  assert.equal(parseReleaseTag('0.18.1'), null);
  assert.equal(parseReleaseTag('v0.018.1'), null);
  assert.equal(parseReleaseTag('v0.18.1-alpha.01'), null);
  assert.equal(parseReleaseTag('not-a-version'), null);
});

test('sorts releases using semantic-version precedence', () => {
  const tags = ['v0.20.0', 'v0.18.1', 'v0.19.0', 'v0.19.0-alpha.1'];
  assert.deepEqual(tags.sort(compareReleaseTags), [
    'v0.18.1',
    'v0.19.0-alpha.1',
    'v0.19.0',
    'v0.20.0',
  ]);
});
