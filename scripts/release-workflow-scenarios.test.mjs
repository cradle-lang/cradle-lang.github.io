import assert from 'node:assert/strict';
import test from 'node:test';

import {evaluateReleaseContracts} from './release-contracts.mjs';
import {createReleaseDoctorCapture} from './release-doctor.mjs';
import {createReleaseEvidence, verifyReleaseEvidenceIntegrity} from './release-evidence.mjs';
import {classifyReleaseFailure} from './release-exception.mjs';
import {verifyReleaseIdentity} from './release-identity.mjs';
import {verifyReleaseJitReadiness} from './release-jit.mjs';
import {
  preparationLifecycleState,
  publicationLifecycleState,
} from './release-lifecycle.mjs';
import {createReleasePrework, verifyReleasePreworkIntegrity} from './release-prework.mjs';
import {deriveReleaseQueue} from './release-reconciler.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';
const SHA_20 = '2020202020202020202020202020202020202020';
const MAIN_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const doctorOutput = [
  'CRADLE v0.19.0 — dependency check', '',
  'Dependency  Status', '------------------', 'git         ✓ OK', '',
  '✓ All required dependencies are installed.', '',
  'Configuration:', '  Config file: <TEMP>/config.toml',
].join('\n');

function evidence(files = [{status: 'modified', path: 'src/cli/doctor.rs'}]) {
  return createReleaseEvidence({
    fromTag: 'v0.18.1', fromSha: SHA_18,
    toTag: 'v0.19.0', toSha: SHA_19, mergeBaseSha: SHA_18,
    commits: [{sha: SHA_19, subject: 'Update doctor command'}],
    files,
  });
}

function artifacts({files, diff = '+command.arg("--json")\n'} = {}) {
  const releaseEvidence = evidence(files);
  const prework = createReleasePrework({evidence: releaseEvidence, diff});
  const doctorCapture = createReleaseDoctorCapture({
    tag: 'v0.19.0', commitSha: SHA_19, packageVersion: '0.19.0',
    exitCode: 0, stdout: doctorOutput, stderr: '',
  });
  return {releaseEvidence, prework, doctorCapture};
}

function queue({completed = ['v0.18.1'], evidenceTags = [], signals = {}} = {}) {
  return deriveReleaseQueue({
    upstreamReleases: [
      {tag: 'v0.18.1', sha: SHA_18},
      {tag: 'v0.19.0', sha: SHA_19},
      {tag: 'v0.20.0', sha: SHA_20},
    ],
    completedTags: completed,
    evidenceTags,
    signals,
  });
}

function validContract(overrides = {}) {
  const {prework, doctorCapture} = artifacts();
  return evaluateReleaseContracts({
    tag: 'v0.19.0',
    targetPath: 'release-notes/v0.19.0.md',
    targetContent: '# Announcing CradleXC 0.19.0\n',
    changedPaths: [
      'release-notes/v0.19.0.md',
      'docs/reference/doctor.md',
      'src/data/homepage-terminal.json',
    ],
    addedLines: 20,
    deletedLines: 2,
    archivedTerminalUnchanged: true,
    terminal: {
      tag: 'v0.19.0', command: 'cxc doctor',
      ariaLabel: 'Successful CradleXC dependency check',
      output: doctorOutput.split('\n'),
    },
    doctorCapture,
    prework,
    ...overrides,
  });
}

test('scenario 1: a new CLI flag requires focused docs and reaches READY', () => {
  const {prework} = artifacts({diff: '+command.arg("--json")\n'});
  assert.equal(prework.classification.requiresUserDocumentation, true);
  assert.equal(queue({evidenceTags: ['v0.19.0']}).selected.state, 'READY');
});

test('scenario 2: a removed command is high risk and reaches READY for review', () => {
  const {prework} = artifacts({
    files: [{status: 'deleted', path: 'src/commands/legacy.rs'}],
    diff: '-command.arg("--legacy")\n',
  });
  assert.equal(prework.classification.possibleBreakingChange, true);
  assert.equal(queue({evidenceTags: ['v0.19.0']}).selected.state, 'READY');
});

test('scenario 3: an internal-only release needs no user documentation', () => {
  const {prework} = artifacts({
    files: [{status: 'modified', path: 'tests/doctor.test.rs'}],
    diff: '+assert!(true);\n',
  });
  assert.equal(prework.classification.level, 'INTERNAL_ONLY');
  assert.equal(prework.classification.requiresUserDocumentation, false);
});

test('scenario 4: several releases wait behind the oldest open PR', () => {
  const result = queue({signals: {openPullRequestTags: ['v0.19.0']}});
  assert.equal(result.selected.state, 'PR_OPEN');
  assert.equal(result.shouldDispatch, false);
  assert.equal(result.releases.at(-1).state, 'QUEUED');
});

test('scenario 5: an upstream evidence mismatch blocks the release', () => {
  const stale = evidence();
  stale.counts.files += 1;
  assert.throws(() => verifyReleaseEvidenceIntegrity(stale), /checksum/);
  assert.equal(queue({signals: {blockedTags: ['v0.19.0']}}).selected.state, 'BLOCKED');
});

test('scenario 6: an upstream SHA mismatch blocks before generation', () => {
  assert.throws(() => verifyReleaseIdentity({
    tag: 'v0.19.0', expectedSha: SHA_19,
    resolvedSha: SHA_20, checkedOutSha: SHA_20,
  }), /instead of supplied SHA/);
  assert.equal(queue({signals: {blockedTags: ['v0.19.0']}}).shouldDispatch, false);
});

test('scenario 7: reconciliation recovers a missed upstream event in FIFO order', () => {
  const result = queue();
  assert.equal(result.selected.tag, 'v0.19.0');
  assert.deepEqual(result.outstanding, ['v0.19.0', 'v0.20.0']);
});

test('scenario 8: stale prework is rejected and reconstructed evidence can become READY', () => {
  const {prework} = artifacts();
  prework.classification.level = 'INTERNAL_ONLY';
  assert.throws(() => verifyReleasePreworkIntegrity(prework), /checksum/);
  assert.equal(queue({evidenceTags: ['v0.19.0']}).selected.state, 'READY');
});

test('scenario 9: an unrelated AI edit fails scope and becomes BLOCKED', () => {
  const report = validContract({changedPaths: ['package.json']});
  assert.equal(report.results.find(({name}) => name === 'scope').passed, false);
  assert.equal(preparationLifecycleState({exceptionRequired: true}), 'BLOCKED');
});

test('scenario 10: an invented doctor default fails the terminal contract', () => {
  const report = validContract({
    terminal: {
      tag: 'v0.19.0', command: 'cxc doctor',
      ariaLabel: 'Successful CradleXC dependency check',
      output: [...doctorOutput.split('\n'), '  Invented default: unsafe'],
    },
  });
  assert.equal(report.results.find(({name}) => name === 'doctor-transcript').passed, false);
  assert.equal(preparationLifecycleState({exceptionRequired: true}), 'BLOCKED');
});

test('scenario 11: human work on the current PR prevents new JIT generation', () => {
  const {releaseEvidence, prework, doctorCapture} = artifacts();
  assert.throws(() => verifyReleaseJitReadiness({
    tag: 'v0.19.0', previousTag: 'v0.18.1',
    currentMainSha: MAIN_SHA, latestMainSha: MAIN_SHA,
    blockingPullRequestCount: 1, historicalTest: false,
    predecessorCompleted: true, targetCompleted: false,
    evidence: releaseEvidence, prework, doctorCapture,
  }), /pull request is already open/);
  assert.equal(queue({signals: {openPullRequestTags: ['v0.19.0']}}).shouldDispatch, false);
});

test('scenario 12: an overlapping release cannot bypass PR1.5 WIP', () => {
  const result = queue({signals: {openPullRequestTags: ['v0.19.0', 'v0.20.0']}});
  assert.equal(result.selected.tag, 'v0.19.0');
  assert.equal(result.shouldDispatch, false);
});

test('scenario 13: publication failure is isolated from completed review', () => {
  assert.equal(
    publicationLifecycleState({publishOutcome: 'failure'}),
    'PUBLICATION_BLOCKED',
  );
});

test('scenario 14: an exhausted API outage is transient infrastructure failure', () => {
  assert.equal(
    classifyReleaseFailure({validationLog: 'network timeout'}),
    'TRANSIENT_INFRASTRUCTURE',
  );
});

test('scenario 15: duplicate release events produce one queue entry', () => {
  const result = deriveReleaseQueue({
    upstreamReleases: [
      {tag: 'v0.19.0', sha: SHA_19},
      {tag: 'v0.19.0', sha: SHA_19},
    ],
    completedTags: [],
  });
  assert.equal(result.releases.length, 1);
  assert.equal(result.selected.tag, 'v0.19.0');
});

test('scenario 16: a manual rerun updates rather than redispatches an open PR', () => {
  const result = queue({signals: {openPullRequestTags: ['v0.19.0']}});
  assert.equal(result.selected.state, 'PR_OPEN');
  assert.equal(result.shouldDispatch, false);
});

test('scenario 17: a blocked release prevents later releases from dispatching', () => {
  const result = queue({signals: {blockedTags: ['v0.19.0']}});
  assert.equal(result.selected.state, 'BLOCKED');
  assert.equal(result.releases.at(-1).state, 'QUEUED');
});

test('scenario 18: successful recovery returns the oldest release to READY', () => {
  const blocked = queue({signals: {blockedTags: ['v0.19.0']}});
  const recovered = queue({evidenceTags: ['v0.19.0']});
  assert.equal(blocked.selected.state, 'BLOCKED');
  assert.equal(recovered.selected.state, 'READY');
  assert.equal(recovered.shouldDispatch, true);
});

test('scenario 19: unsuccessful recovery remains BLOCKED', () => {
  const first = queue({signals: {blockedTags: ['v0.19.0']}});
  const retry = queue({
    evidenceTags: ['v0.19.0'],
    signals: {blockedTags: ['v0.19.0']},
  });
  assert.equal(first.selected.state, 'BLOCKED');
  assert.equal(retry.selected.state, 'BLOCKED');
  assert.equal(retry.shouldDispatch, false);
});
