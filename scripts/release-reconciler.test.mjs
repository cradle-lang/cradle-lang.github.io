import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  completedTagsFromReleaseNotes,
  deriveReleaseQueue,
  normalizeReleaseQueueSignals,
  parseUpstreamReleaseInventory,
  readCompletedReleaseTags,
  reconcileReleases,
} from './release-reconciler.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';
const SHA_20 = '2020202020202020202020202020202020202020';
const SHA_21 = '2121212121212121212121212121212121212121';
const SHA_22 = '2222222222222222222222222222222222222222';
const SHA_23 = '2323232323232323232323232323232323232323';
const SHA_24 = '2424242424242424242424242424242424242424';

test('parses and normalizes an upstream tag and SHA inventory', () => {
  const releases = parseUpstreamReleaseInventory([
    'v0.19.0\tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'v0.18.1\tbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'v0.19.0\taaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '',
  ].join('\n'));

  assert.deepEqual(releases, [
    {
      tag: 'v0.19.0',
      sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    {
      tag: 'v0.18.1',
      sha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    },
  ]);
});

test('rejects malformed upstream release identities', () => {
  assert.throws(
    () => parseUpstreamReleaseInventory('v0.19.0\tnot-a-commit-sha\n'),
    /Invalid upstream release inventory line/,
  );
});

test('rejects conflicting SHAs for the same upstream tag', () => {
  assert.throws(
    () => parseUpstreamReleaseInventory([
      'v0.19.0\taaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'v0.19.0\tbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ].join('\n')),
    /Conflicting commit SHAs/,
  );
});

test('selects the oldest outstanding production release', () => {
  const result = reconcileReleases({
    upstreamTags: [
      'v0.20.0',
      'v0.18.1',
      'v0.19.0',
    ],
    completedTags: ['v0.18.1'],
  });

  assert.deepEqual(result.eligible, [
    'v0.18.1',
    'v0.19.0',
    'v0.20.0',
  ]);

  assert.deepEqual(result.completed, [
    'v0.18.1',
  ]);

  assert.deepEqual(result.outstanding, [
    'v0.19.0',
    'v0.20.0',
  ]);

  assert.equal(result.selected, 'v0.19.0');
});

test('excludes tags that are not production releases', () => {
  const result = reconcileReleases({
    upstreamTags: [
      'not-a-version',
      'v0.16.0',
      'v0.18.0',
      'v0.18.1',
      'v0.19.0-alpha.1',
      'v0.19.0',
    ],
    completedTags: ['v0.18.1'],
  });

  assert.deepEqual(result.eligible, [
    'v0.18.1',
    'v0.19.0',
  ]);

  assert.deepEqual(result.outstanding, [
    'v0.19.0',
  ]);

  assert.equal(result.selected, 'v0.19.0');
});

test('removes duplicate tags', () => {
  const result = reconcileReleases({
    upstreamTags: [
      'v0.18.1',
      'v0.19.0',
      'v0.19.0',
      'v0.20.0',
      'v0.20.0',
    ],
    completedTags: [
      'v0.18.1',
      'v0.18.1',
    ],
  });

  assert.deepEqual(result.eligible, [
    'v0.18.1',
    'v0.19.0',
    'v0.20.0',
  ]);

  assert.deepEqual(result.completed, [
    'v0.18.1',
  ]);
});

test('returns an empty queue when every release is completed', () => {
  const result = reconcileReleases({
    upstreamTags: [
      'v0.18.1',
      'v0.19.0',
    ],
    completedTags: [
      'v0.18.1',
      'v0.19.0',
    ],
  });

  assert.deepEqual(result.outstanding, []);
  assert.equal(result.selected, null);
});

test('does not skip a missing release in the middle', () => {
  const result = reconcileReleases({
    upstreamTags: [
      'v0.18.1',
      'v0.19.0',
      'v0.20.0',
    ],
    completedTags: [
      'v0.18.1',
      'v0.20.0',
    ],
  });

  assert.deepEqual(result.outstanding, [
    'v0.19.0',
  ]);

  assert.equal(result.selected, 'v0.19.0');
});

test('ignores invalid and historical completed tags', () => {
  const result = reconcileReleases({
    upstreamTags: [
      'v0.18.1',
      'v0.19.0',
    ],
    completedTags: [
      'not-a-version',
      'v0.16.0',
      'v0.18.1',
    ],
  });

  assert.deepEqual(result.completed, [
    'v0.18.1',
  ]);

  assert.equal(result.selected, 'v0.19.0');
});

test('does not mutate the supplied arrays', () => {
  const upstreamTags = [
    'v0.20.0',
    'v0.18.1',
    'v0.19.0',
  ];

  const completedTags = [
    'v0.19.0',
    'v0.18.1',
  ];

  const originalUpstream = [...upstreamTags];
  const originalCompleted = [...completedTags];

  reconcileReleases({
    upstreamTags,
    completedTags,
  });

  assert.deepEqual(upstreamTags, originalUpstream);
  assert.deepEqual(completedTags, originalCompleted);
});

test('derives every queue state from authoritative state and signals', () => {
  const upstreamReleases = [
    {tag: 'v0.18.1', sha: SHA_18},
    {tag: 'v0.19.0', sha: SHA_19},
    {tag: 'v0.20.0', sha: SHA_20},
    {tag: 'v0.21.0', sha: SHA_21},
    {tag: 'v0.22.0', sha: SHA_22},
    {tag: 'v0.23.0', sha: SHA_23},
    {tag: 'v0.24.0', sha: SHA_24},
  ];

  const result = deriveReleaseQueue({
    upstreamReleases,
    completedTags: ['v0.18.1'],
    evidenceTags: ['v0.19.0'],
    signals: {
      precomputingTags: ['v0.20.0'],
      processingTags: ['v0.21.0'],
      openPullRequestTags: ['v0.22.0'],
      blockedTags: ['v0.23.0'],
    },
  });

  assert.deepEqual(
    result.releases.map(({tag, state}) => ({tag, state})),
    [
      {tag: 'v0.18.1', state: 'COMPLETED'},
      {tag: 'v0.19.0', state: 'READY'},
      {tag: 'v0.20.0', state: 'PRECOMPUTING'},
      {tag: 'v0.21.0', state: 'PROCESSING'},
      {tag: 'v0.22.0', state: 'PR_OPEN'},
      {tag: 'v0.23.0', state: 'BLOCKED'},
      {tag: 'v0.24.0', state: 'QUEUED'},
    ],
  );
  assert.deepEqual(result.selected, {
    tag: 'v0.19.0',
    sha: SHA_19,
    state: 'READY',
  });
  assert.equal(result.shouldDispatch, true);
});

test('does not skip an oldest release whose pull request is open', () => {
  const result = deriveReleaseQueue({
    upstreamReleases: [
      {tag: 'v0.18.1', sha: SHA_18},
      {tag: 'v0.19.0', sha: SHA_19},
      {tag: 'v0.20.0', sha: SHA_20},
    ],
    completedTags: ['v0.18.1'],
    evidenceTags: ['v0.20.0'],
    signals: {openPullRequestTags: ['v0.19.0']},
  });

  assert.equal(result.selected.tag, 'v0.19.0');
  assert.equal(result.selected.state, 'PR_OPEN');
  assert.equal(result.shouldDispatch, false);
});

test('normalizes queue signals and ignores non-production tags', () => {
  assert.deepEqual(
    normalizeReleaseQueueSignals({
      openPullRequestTags: [
        'v0.20.0',
        'invalid',
        'v0.19.0',
        'v0.20.0',
      ],
    }),
    {
      precomputingTags: [],
      processingTags: [],
      openPullRequestTags: ['v0.19.0', 'v0.20.0'],
      blockedTags: [],
    },
  );
});

test('derives completed production tags from release-note filenames', () => {
  const completed = completedTagsFromReleaseNotes([
    'README.md',
    'v0.20.0.md',
    'v0.16.0.md',
    'v0.18.1.md',
    'release-notes-v0.16.0-preview.md',
    'v0.19.0-alpha.1.md',
    'v0.19.0.md',
  ]);

  assert.deepEqual(completed, [
    'v0.18.1',
    'v0.19.0',
    'v0.20.0',
  ]);
});

test('reads completed production tags from a release-notes directory', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-release-test-'),
  );

  try {
    await Promise.all([
      fs.writeFile(
        path.join(directory, 'v0.20.0.md'),
        '# Release 0.20.0\n',
      ),
      fs.writeFile(
        path.join(directory, 'v0.18.1.md'),
        '# Release 0.18.1\n',
      ),
      fs.writeFile(
        path.join(directory, 'v0.16.0.md'),
        '# Historical test\n',
      ),
      fs.writeFile(
        path.join(directory, 'README.md'),
        '# Release notes\n',
      ),
      fs.mkdir(
        path.join(directory, 'v0.19.0.md'),
      ),
    ]);

    const completed = await readCompletedReleaseTags(directory);

    assert.deepEqual(completed, [
      'v0.18.1',
      'v0.20.0',
    ]);
  } finally {
    await fs.rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
