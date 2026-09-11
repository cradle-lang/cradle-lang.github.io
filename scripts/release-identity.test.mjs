import assert from 'node:assert/strict';
import test from 'node:test';

import {verifyReleaseIdentity} from './release-identity.mjs';

const SHA_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const SHA_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

test('accepts a production identity when all SHAs agree', () => {
  assert.deepEqual(
    verifyReleaseIdentity({
      tag: 'v0.19.0',
      expectedSha: SHA_A.toUpperCase(),
      resolvedSha: SHA_A,
      checkedOutSha: SHA_A,
    }),
    {
      tag: 'v0.19.0',
      commitSha: SHA_A,
    },
  );
});

test('requires an expected SHA for production releases', () => {
  assert.throws(
    () => verifyReleaseIdentity({
      tag: 'v0.19.0',
      expectedSha: '',
      resolvedSha: SHA_A,
      checkedOutSha: SHA_A,
    }),
    /Expected SHA must be a full 40-character commit SHA/,
  );
});

test('allows a historical test without a supplied expected SHA', () => {
  assert.deepEqual(
    verifyReleaseIdentity({
      tag: 'v0.16.0',
      expectedSha: '',
      resolvedSha: SHA_A,
      checkedOutSha: SHA_A,
      historicalTest: true,
    }),
    {
      tag: 'v0.16.0',
      commitSha: SHA_A,
    },
  );
});

test('rejects a checkout that does not match the tag', () => {
  assert.throws(
    () => verifyReleaseIdentity({
      tag: 'v0.19.0',
      expectedSha: SHA_A,
      resolvedSha: SHA_A,
      checkedOutSha: SHA_B,
    }),
    /was checked out/,
  );
});

test('rejects a tag that moved after reconciliation', () => {
  assert.throws(
    () => verifyReleaseIdentity({
      tag: 'v0.19.0',
      expectedSha: SHA_A,
      resolvedSha: SHA_B,
      checkedOutSha: SHA_B,
    }),
    /instead of supplied SHA/,
  );
});
