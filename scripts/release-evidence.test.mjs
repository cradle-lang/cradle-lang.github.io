import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectReleaseEvidence,
  createReleaseEvidence,
  parseChangedFiles,
  readReleaseEvidence,
  verifyReleaseEvidenceMetadata,
  verifyReleaseEvidenceIntegrity,
  writeReleaseEvidence,
} from './release-evidence.mjs';
import {
  ReleaseEvidenceIdentityError,
  verifyOrRebuildReleaseEvidence,
} from './release-evidence-control.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';

function git(directory, ...arguments_) {
  return execFileSync('git', ['-C', directory, ...arguments_], {
    encoding: 'utf8',
  }).trim();
}

function sampleEvidence() {
  return createReleaseEvidence({
    fromTag: 'v0.18.1',
    fromSha: SHA_18,
    toTag: 'v0.19.0',
    toSha: SHA_19,
    mergeBaseSha: SHA_18,
    commits: [{sha: SHA_19, subject: 'Add backend selection'}],
    files: [
      {status: 'modified', path: 'src/cli/backend.mjs'},
      {status: 'added', path: 'tests/backend.test.mjs'},
    ],
  });
}

test('parses ordinary and renamed changed files', () => {
  assert.deepEqual(
    parseChangedFiles(
      'M\0src/cli.mjs\0R100\0docs/old.md\0docs/new.md\0',
    ),
    [
      {
        status: 'renamed',
        similarity: 100,
        oldPath: 'docs/old.md',
        path: 'docs/new.md',
      },
      {status: 'modified', path: 'src/cli.mjs'},
    ],
  );
});

test('creates deterministic evidence with counts, areas, and checksum', () => {
  const evidence = sampleEvidence();

  assert.deepEqual(evidence.counts, {
    commits: 1,
    files: 2,
    byStatus: {added: 1, modified: 1},
  });
  assert.deepEqual(evidence.sourceAreas, ['src', 'tests']);
  assert.equal(evidence.comparison.fromIsAncestor, true);
  assert.match(evidence.sha256, /^[0-9a-f]{64}$/);
  assert.doesNotThrow(() => verifyReleaseEvidenceIntegrity(evidence));
});

test('rejects evidence changed after its checksum was calculated', () => {
  const evidence = sampleEvidence();
  evidence.files[0].path = 'src/changed-after-collection.mjs';

  assert.throws(
    () => verifyReleaseEvidenceIntegrity(evidence),
    /checksum does not match/,
  );
});

test('writes a versioned evidence package', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-evidence-write-'),
  );

  try {
    const evidence = sampleEvidence();
    const outputPath = await writeReleaseEvidence(directory, evidence);
    assert.equal(outputPath, path.join(directory, 'v0.19.0.json'));
    assert.deepEqual(
      JSON.parse(await fs.readFile(outputPath, 'utf8')),
      evidence,
    );
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('reads evidence and verifies it against upstream and provenance', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-evidence-read-'),
  );

  try {
    const evidence = sampleEvidence();
    await writeReleaseEvidence(
      path.join(directory, 'evidence'),
      evidence,
    );
    const records = await readReleaseEvidence(directory);
    const evidenceByTag = verifyReleaseEvidenceMetadata({
      completedTags: ['v0.18.1', 'v0.19.0'],
      upstreamReleases: [
        {tag: 'v0.18.1', sha: SHA_18},
        {tag: 'v0.19.0', sha: SHA_19},
      ],
      evidenceRecords: records,
      provenanceRecords: [{
        tag: 'v0.19.0',
        commitSha: SHA_19,
        previousTag: 'v0.18.1',
        previousCommitSha: SHA_18,
      }],
      exemptTags: ['v0.18.1'],
    });

    assert.equal(evidenceByTag.get('v0.19.0').sha256, evidence.sha256);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('requires evidence for every non-exempt completed release', () => {
  assert.throws(
    () => verifyReleaseEvidenceMetadata({
      completedTags: ['v0.18.1', 'v0.19.0'],
      upstreamReleases: [
        {tag: 'v0.18.1', sha: SHA_18},
        {tag: 'v0.19.0', sha: SHA_19},
      ],
      evidenceRecords: [],
      provenanceRecords: [],
      exemptTags: ['v0.18.1'],
    }),
    /Missing required release evidence for v0\.19\.0/,
  );
});

test('collects evidence from a real Git comparison', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-evidence-git-'),
  );

  try {
    git(directory, 'init', '--quiet');
    git(directory, 'config', 'user.name', 'Release Evidence Test');
    git(directory, 'config', 'user.email', 'release-evidence@example.invalid');
    await fs.mkdir(path.join(directory, 'src'));
    await fs.writeFile(path.join(directory, 'src', 'cli.mjs'), 'old\n');
    git(directory, 'add', 'src/cli.mjs');
    git(directory, 'commit', '--quiet', '-m', 'Initial CLI');
    git(directory, 'tag', 'v0.18.1');

    await fs.writeFile(path.join(directory, 'src', 'cli.mjs'), 'new\n');
    await fs.mkdir(path.join(directory, 'tests'));
    await fs.writeFile(path.join(directory, 'tests', 'cli.test.mjs'), 'test\n');
    git(directory, 'add', 'src/cli.mjs', 'tests/cli.test.mjs');
    git(directory, 'commit', '--quiet', '-m', 'Change CLI behavior');
    git(directory, 'tag', 'v0.19.0');

    const evidence = collectReleaseEvidence({
      repositoryDirectory: directory,
      fromTag: 'v0.18.1',
      toTag: 'v0.19.0',
    });

    assert.equal(evidence.from.sha, git(directory, 'rev-parse', 'v0.18.1'));
    assert.equal(evidence.to.sha, git(directory, 'rev-parse', 'v0.19.0'));
    assert.equal(evidence.counts.commits, 1);
    assert.deepEqual(evidence.commits.map(({subject}) => subject), [
      'Change CLI behavior',
    ]);
    assert.deepEqual(evidence.files, [
      {status: 'modified', path: 'src/cli.mjs'},
      {status: 'added', path: 'tests/cli.test.mjs'},
    ]);
    assert.deepEqual(evidence.sourceAreas, ['src', 'tests']);

    const outputDirectory = path.join(directory, 'evidence');
    const githubOutput = path.join(directory, 'github-output');
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/generate-release-evidence.mjs'),
        directory,
        outputDirectory,
        'v0.18.1',
        'v0.19.0',
      ],
      {
        encoding: 'utf8',
        env: {...process.env, GITHUB_OUTPUT: githubOutput},
      },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 commits, 2 files/);
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(
          path.join(outputDirectory, 'v0.19.0.json'),
          'utf8',
        ),
      ),
      evidence,
    );
    const outputs = await fs.readFile(githubOutput, 'utf8');
    assert.match(outputs, /sha256=[0-9a-f]{64}/);
    assert.match(outputs, /commit_count=1/);
    assert.match(outputs, /file_count=2/);

    const evidencePath = path.join(outputDirectory, 'v0.19.0.json');
    const verification = await verifyOrRebuildReleaseEvidence({
      repositoryDirectory: directory,
      evidencePath,
      fromTag: 'v0.18.1',
      fromSha: evidence.from.sha,
      toTag: 'v0.19.0',
      toSha: evidence.to.sha,
    });
    assert.equal(verification.rebuilt, false);

    const corrupted = structuredClone(evidence);
    corrupted.files[0].path = 'src/not-from-git.mjs';
    await fs.writeFile(evidencePath, JSON.stringify(corrupted));
    const recovered = await verifyOrRebuildReleaseEvidence({
      repositoryDirectory: directory,
      evidencePath,
      fromTag: 'v0.18.1',
      fromSha: evidence.from.sha,
      toTag: 'v0.19.0',
      toSha: evidence.to.sha,
    });
    assert.equal(recovered.rebuilt, true);
    assert.match(recovered.reason, /checksum does not match/);
    assert.deepEqual(
      JSON.parse(await fs.readFile(evidencePath, 'utf8')),
      evidence,
    );

    await assert.rejects(
      verifyOrRebuildReleaseEvidence({
        repositoryDirectory: directory,
        evidencePath,
        fromTag: 'v0.18.1',
        fromSha: evidence.from.sha,
        toTag: 'v0.19.0',
        toSha: SHA_19,
      }),
      ReleaseEvidenceIdentityError,
    );

    const verificationOutput = path.join(directory, 'verification-output');
    const verificationResult = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/verify-release-evidence.mjs'),
        directory,
        evidencePath,
        'v0.18.1',
        evidence.from.sha,
        'v0.19.0',
        evidence.to.sha,
        'false',
      ],
      {
        encoding: 'utf8',
        env: {...process.env, GITHUB_OUTPUT: verificationOutput},
      },
    );
    assert.equal(verificationResult.status, 0, verificationResult.stderr);
    assert.match(verificationResult.stdout, /without reconstruction/);
    assert.match(
      await fs.readFile(verificationOutput, 'utf8'),
      /rebuilt=false/,
    );
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('evidence CLI fails with usage guidance when arguments are missing', () => {
  const result = spawnSync(
    process.execPath,
    [path.resolve('scripts/generate-release-evidence.mjs')],
    {encoding: 'utf8'},
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node scripts\/generate-release-evidence/);
});
