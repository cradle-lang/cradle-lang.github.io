import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectReleaseEvidence,
  createReleaseEvidence,
  writeReleaseEvidence,
} from './release-evidence.mjs';
import {
  createReleasePrework,
  verifyReleasePreworkIntegrity,
  writeReleasePrework,
} from './release-prework.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';

function git(directory, ...arguments_) {
  return execFileSync('git', ['-C', directory, ...arguments_], {
    encoding: 'utf8',
  }).trim();
}

function evidenceFor(files, subjects = ['Implement change']) {
  return createReleaseEvidence({
    fromTag: 'v0.18.1',
    fromSha: SHA_18,
    toTag: 'v0.19.0',
    toSha: SHA_19,
    mergeBaseSha: SHA_18,
    commits: subjects.map((subject, index) => ({
      sha: `${index + 1}`.repeat(40),
      subject,
    })),
    files,
  });
}

test('classifies a localized CLI change and finds likely documentation', () => {
  const prework = createReleasePrework({
    evidence: evidenceFor([
      {status: 'modified', path: 'src/cli/backend.rs'},
    ]),
    diff: '+command.arg("--backend")\n',
    documentationEntries: [
      {
        filePath: 'docs/backend-selection.md',
        content: 'Select a backend with the --backend flag.',
      },
      {
        filePath: 'docs/unrelated.md',
        content: 'Unrelated documentation.',
      },
    ],
  });

  assert.equal(prework.classification.level, 'SMALL_USER_FACING');
  assert.equal(prework.classification.requiresUserDocumentation, true);
  assert.deepEqual(prework.signals.changedCommands, ['backend']);
  assert.deepEqual(prework.signals.addedFlags, ['--backend']);
  assert.deepEqual(prework.likelyDocumentation, [{
    path: 'docs/backend-selection.md',
    matchedTerms: ['backend'],
  }]);
  assert.deepEqual(prework.riskIndicators, ['cli-contract-change']);
  assert.doesNotThrow(() => verifyReleasePreworkIntegrity(prework));
});

test('classifies tests and CI changes as internal only', () => {
  const prework = createReleasePrework({
    evidence: evidenceFor([
      {status: 'modified', path: '.github/workflows/ci.yml'},
      {status: 'added', path: 'tests/parser.test.rs'},
    ]),
    diff: '+run parser test\n',
  });

  assert.equal(prework.classification.level, 'INTERNAL_ONLY');
  assert.equal(prework.classification.requiresUserDocumentation, false);
});

test('classifies source changes without a user-facing signal as release-note only', () => {
  const prework = createReleasePrework({
    evidence: evidenceFor([
      {status: 'modified', path: 'src/optimizer.rs'},
    ]),
    diff: '+optimize_internal_graph();\n',
  });

  assert.equal(prework.classification.level, 'RELEASE_NOTE_ONLY');
  assert.equal(prework.classification.requiresUserDocumentation, false);
});

test('classifies multi-domain or removal signals as complex user-facing', () => {
  const prework = createReleasePrework({
    evidence: evidenceFor(
      [
        {status: 'modified', path: 'src/cli/backend.rs'},
        {status: 'deleted', path: 'src/config/legacy.rs'},
      ],
      ['Remove legacy configuration'],
    ),
    diff: '-command.arg("--legacy-backend")\n+new_default = true\n',
  });

  assert.equal(prework.classification.level, 'COMPLEX_USER_FACING');
  assert.equal(prework.classification.possibleBreakingChange, true);
  assert.deepEqual(prework.classification.domains, ['cli', 'configuration']);
  assert.deepEqual(prework.signals.removedFlags, ['--legacy-backend']);
  assert.deepEqual(prework.signals.defaultLineChanges, {added: 1, removed: 0});
  assert.ok(prework.riskIndicators.includes('possible-breaking-change'));
});

test('rejects prework changed after its checksum was calculated', () => {
  const prework = createReleasePrework({
    evidence: evidenceFor([
      {status: 'modified', path: 'src/optimizer.rs'},
    ]),
    diff: '+change\n',
  });
  prework.classification.level = 'INTERNAL_ONLY';

  assert.throws(
    () => verifyReleasePreworkIntegrity(prework),
    /checksum does not match/,
  );
});

test('writes prework and runs the CLI against a real Git comparison', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-prework-git-'),
  );

  try {
    git(directory, 'init', '--quiet');
    git(directory, 'config', 'user.name', 'Release Prework Test');
    git(directory, 'config', 'user.email', 'release-prework@example.invalid');
    await fs.mkdir(path.join(directory, 'src', 'cli'), {recursive: true});
    await fs.writeFile(
      path.join(directory, 'src', 'cli', 'backend.rs'),
      'fn backend() {}\n',
    );
    git(directory, 'add', 'src/cli/backend.rs');
    git(directory, 'commit', '--quiet', '-m', 'Initial backend');
    git(directory, 'tag', 'v0.18.1');

    await fs.writeFile(
      path.join(directory, 'src', 'cli', 'backend.rs'),
      'fn backend() { arg("--backend"); }\n',
    );
    git(directory, 'add', 'src/cli/backend.rs');
    git(directory, 'commit', '--quiet', '-m', 'Add backend flag');
    git(directory, 'tag', 'v0.19.0');

    const evidence = collectReleaseEvidence({
      repositoryDirectory: directory,
      fromTag: 'v0.18.1',
      toTag: 'v0.19.0',
    });
    const evidenceDirectory = path.join(directory, 'evidence');
    const evidencePath = await writeReleaseEvidence(
      evidenceDirectory,
      evidence,
    );
    const documentationDirectory = path.join(directory, 'docs');
    await fs.mkdir(documentationDirectory);
    await fs.writeFile(
      path.join(documentationDirectory, 'backend.md'),
      'Configure the backend option.\n',
    );
    const outputDirectory = path.join(directory, 'prework');
    const githubOutput = path.join(directory, 'github-output');
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/generate-release-prework.mjs'),
        directory,
        evidencePath,
        documentationDirectory,
        outputDirectory,
      ],
      {
        encoding: 'utf8',
        env: {...process.env, GITHUB_OUTPUT: githubOutput},
      },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /SMALL_USER_FACING/);
    const preworkPath = path.join(outputDirectory, 'v0.19.0.json');
    const prework = JSON.parse(await fs.readFile(preworkPath, 'utf8'));
    assert.equal(prework.evidenceSha256, evidence.sha256);
    assert.deepEqual(prework.signals.addedFlags, ['--backend']);
    assert.match(
      await fs.readFile(githubOutput, 'utf8'),
      /requires_documentation=true/,
    );

    const copyDirectory = path.join(directory, 'prework-copy');
    assert.equal(
      await writeReleasePrework(copyDirectory, prework),
      path.join(copyDirectory, 'v0.19.0.json'),
    );
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});
