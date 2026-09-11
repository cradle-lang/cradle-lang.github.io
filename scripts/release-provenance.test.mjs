import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  createReleaseProvenance,
  readReleaseProvenance,
  verifyCompletedReleaseProvenance,
  writeReleaseProvenance,
} from './release-provenance.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';
const MOVED_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const provenance = createReleaseProvenance({
  tag: 'v0.19.0',
  commitSha: SHA_19,
  previousTag: 'v0.18.1',
  previousCommitSha: SHA_18,
});

test('creates normalized release provenance', () => {
  assert.deepEqual(
    createReleaseProvenance({
      tag: 'v0.19.0',
      commitSha: SHA_19.toUpperCase(),
      previousTag: 'v0.18.1',
      previousCommitSha: SHA_18,
    }),
    provenance,
  );
});

test('requires the previous release to precede the target', () => {
  assert.throws(
    () => createReleaseProvenance({
      tag: 'v0.19.0',
      commitSha: SHA_19,
      previousTag: 'v0.20.0',
      previousCommitSha: SHA_18,
    }),
    /must precede/,
  );
});

test('writes and reads a provenance sidecar', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-provenance-'),
  );

  try {
    const outputPath = await writeReleaseProvenance(directory, provenance);
    assert.equal(
      outputPath,
      path.join(directory, 'provenance', 'v0.19.0.json'),
    );
    assert.deepEqual(await readReleaseProvenance(directory), [provenance]);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('accepts matching provenance and an explicit baseline exemption', () => {
  assert.doesNotThrow(() => verifyCompletedReleaseProvenance({
    completedTags: ['v0.18.1', 'v0.19.0'],
    upstreamReleases: [
      {tag: 'v0.18.1', sha: SHA_18},
      {tag: 'v0.19.0', sha: SHA_19},
    ],
    provenanceRecords: [provenance],
    exemptTags: ['v0.18.1'],
  }));
});

test('rejects a missing required provenance record', () => {
  assert.throws(
    () => verifyCompletedReleaseProvenance({
      completedTags: ['v0.18.1', 'v0.19.0'],
      upstreamReleases: [
        {tag: 'v0.18.1', sha: SHA_18},
        {tag: 'v0.19.0', sha: SHA_19},
      ],
      provenanceRecords: [],
      exemptTags: ['v0.18.1'],
    }),
    /Missing required release provenance for v0\.19\.0/,
  );
});

test('rejects a completed tag that moved after documentation', () => {
  assert.throws(
    () => verifyCompletedReleaseProvenance({
      completedTags: ['v0.18.1', 'v0.19.0'],
      upstreamReleases: [
        {tag: 'v0.18.1', sha: SHA_18},
        {tag: 'v0.19.0', sha: MOVED_SHA},
      ],
      provenanceRecords: [provenance],
      exemptTags: ['v0.18.1'],
    }),
    /v0\.19\.0 moved after documentation/,
  );
});

test('rejects a previous tag that moved after documentation', () => {
  assert.throws(
    () => verifyCompletedReleaseProvenance({
      completedTags: ['v0.18.1', 'v0.19.0'],
      upstreamReleases: [
        {tag: 'v0.18.1', sha: MOVED_SHA},
        {tag: 'v0.19.0', sha: SHA_19},
      ],
      provenanceRecords: [provenance],
      exemptTags: ['v0.18.1'],
    }),
    /v0\.18\.1 moved after documentation/,
  );
});
