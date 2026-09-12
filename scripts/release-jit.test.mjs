import assert from 'node:assert/strict';
import test from 'node:test';

import {createReleaseEvidence} from './release-evidence.mjs';
import {createReleaseDoctorCapture} from './release-doctor.mjs';
import {verifyReleaseJitReadiness} from './release-jit.mjs';
import {createReleasePrework} from './release-prework.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';
const MAIN_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function inputs(overrides = {}) {
  const evidence = createReleaseEvidence({
    fromTag: 'v0.18.1',
    fromSha: SHA_18,
    toTag: 'v0.19.0',
    toSha: SHA_19,
    mergeBaseSha: SHA_18,
    commits: [{sha: SHA_19, subject: 'Add backend selection'}],
    files: [{status: 'modified', path: 'src/cli/backend.rs'}],
  });
  const prework = createReleasePrework({
    evidence,
    diff: '+command.arg("--backend")\n',
  });
  const doctorCapture = createReleaseDoctorCapture({
    tag: 'v0.19.0',
    commitSha: SHA_19,
    packageVersion: '0.19.0',
    exitCode: 0,
    stdout: 'CRADLE v0.19.0 — dependency check\nAll dependencies installed.\n',
    stderr: '',
  });

  return {
    tag: 'v0.19.0',
    previousTag: 'v0.18.1',
    currentMainSha: MAIN_SHA,
    latestMainSha: MAIN_SHA,
    blockingPullRequestCount: 0,
    historicalTest: false,
    predecessorCompleted: true,
    targetCompleted: false,
    evidence,
    prework,
    doctorCapture,
    ...overrides,
  };
}

test('accepts a release only when every final-generation condition is current', () => {
  assert.deepEqual(verifyReleaseJitReadiness(inputs()), {
    state: 'READY',
    tag: 'v0.19.0',
    previousTag: 'v0.18.1',
    classification: 'SMALL_USER_FACING',
    requiresUserDocumentation: true,
  });
});

test('rejects a stale documentation main checkout', () => {
  assert.throws(
    () => verifyReleaseJitReadiness(inputs({
      latestMainSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    })),
    /stale relative to the latest main branch/,
  );
});

test('blocks production generation while a release pull request is open', () => {
  assert.throws(
    () => verifyReleaseJitReadiness(inputs({blockingPullRequestCount: 1})),
    /pull request is already open/,
  );
  assert.equal(
    verifyReleaseJitReadiness(inputs({
      blockingPullRequestCount: 1,
      historicalTest: true,
    })).state,
    'READY',
  );
});

test('requires a completed predecessor and an unfinished target', () => {
  assert.throws(
    () => verifyReleaseJitReadiness(inputs({predecessorCompleted: false})),
    /Predecessor release note is not completed/,
  );
  assert.throws(
    () => verifyReleaseJitReadiness(inputs({targetCompleted: true})),
    /Target release note is already completed/,
  );
});

test('rejects prework that belongs to different evidence', () => {
  const mismatchedEvidence = createReleaseEvidence({
    fromTag: 'v0.18.1',
    fromSha: SHA_18,
    toTag: 'v0.19.0',
    toSha: SHA_19,
    mergeBaseSha: SHA_18,
    commits: [{sha: SHA_19, subject: 'Different evidence'}],
    files: [{status: 'modified', path: 'src/cli/backend.rs'}],
  });

  assert.throws(
    () => verifyReleaseJitReadiness(inputs({evidence: mismatchedEvidence})),
    /prework is not derived from the verified evidence/,
  );
});

test('rejects a doctor capture built from a different upstream commit', () => {
  const doctorCapture = createReleaseDoctorCapture({
    tag: 'v0.19.0',
    commitSha: '2020202020202020202020202020202020202020',
    packageVersion: '0.19.0',
    exitCode: 0,
    stdout: 'CRADLE v0.19.0 — dependency check\nAll dependencies installed.\n',
    stderr: '',
  });

  assert.throws(
    () => verifyReleaseJitReadiness(inputs({doctorCapture})),
    /doctor capture does not match the verified release/,
  );
});
