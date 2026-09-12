import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildReleaseAiContext,
  calculateReleaseAiContextSha256,
  createReleaseAiContext,
} from './release-ai-context.mjs';
import {
  collectReleaseEvidence,
  createReleaseEvidence,
} from './release-evidence.mjs';
import {createReleaseDoctorCapture} from './release-doctor.mjs';
import {
  buildReleasePrework,
  createReleasePrework,
} from './release-prework.mjs';

function git(directory, ...arguments_) {
  return execFileSync('git', ['-C', directory, ...arguments_], {
    encoding: 'utf8',
  }).trim();
}

test('builds a checksummed context from both tagged file versions', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-ai-context-'),
  );
  const originalDirectory = process.cwd();

  try {
    git(directory, 'init', '--quiet');
    git(directory, 'config', 'user.name', 'AI Context Test');
    git(directory, 'config', 'user.email', 'ai-context@example.invalid');
    await fs.mkdir(path.join(directory, 'src', 'cli'), {recursive: true});
    await fs.mkdir(path.join(directory, 'docs'));
    await fs.mkdir(path.join(directory, 'release-notes'));
    await fs.writeFile(
      path.join(directory, 'src', 'cli', 'backend.rs'),
      'fn backend() { arg("--old-backend"); }\n',
    );
    git(directory, 'add', 'src/cli/backend.rs');
    git(directory, 'commit', '--quiet', '-m', 'Initial backend');
    git(directory, 'tag', 'v0.18.1');

    await fs.writeFile(
      path.join(directory, 'src', 'cli', 'backend.rs'),
      `fn backend() { arg("--backend"); }\n${'x'.repeat(21_000)}\n`,
    );
    await fs.mkdir(path.join(directory, 'src', 'runtime'));
    await Promise.all(Array.from({length: 41}, (_, index) =>
      fs.writeFile(
        path.join(directory, 'src', 'runtime', `module-${index}.rs`),
        `fn module_${index}() {}\n`,
      ),
    ));
    git(directory, 'add', 'src');
    git(directory, 'commit', '--quiet', '-m', 'Change backend flag');
    git(directory, 'tag', 'v0.19.0');

    const docsPath = path.join(directory, 'docs', 'backend.md');
    const previousNotePath = path.join(
      directory,
      'release-notes',
      'v0.18.1.md',
    );
    await fs.writeFile(docsPath, 'Choose a backend for compilation.\n');
    await fs.writeFile(previousNotePath, '# Announcing CradleXC 0.18.1\n');
    const evidence = collectReleaseEvidence({
      repositoryDirectory: directory,
      fromTag: 'v0.18.1',
      toTag: 'v0.19.0',
    });

    process.chdir(directory);
    const prework = await buildReleasePrework({
      repositoryDirectory: directory,
      evidence,
      documentationDirectory: path.join(directory, 'docs'),
    });
    const context = await buildReleaseAiContext({
      repositoryDirectory: directory,
      evidence,
      prework,
      doctorCapture: createReleaseDoctorCapture({
        tag: 'v0.19.0',
        commitSha: evidence.to.sha,
        packageVersion: '0.19.0',
        exitCode: 0,
        stdout: 'CRADLE v0.19.0 — dependency check\nAll dependencies installed.\n',
        stderr: '',
      }),
      previousReleaseNotePath: previousNotePath,
    });

    assert.equal(context.release.tag, 'v0.19.0');
    assert.equal(context.previousReleaseNote.content, '# Announcing CradleXC 0.18.1\n');
    assert.equal(context.upstreamFiles.length, 42);
    assert.match(context.upstreamFiles[0].before.content, /--old-backend/);
    assert.match(context.upstreamFiles[0].after.content, /--backend/);
    assert.equal(context.upstreamFiles[0].after.truncated, true);
    assert.equal(context.upstreamFiles[0].after.content.length, 20_000);
    assert.match(context.documentationFiles[0].path, /docs\/backend\.md$/);
    assert.equal(context.sha256, calculateReleaseAiContextSha256(context));
  } finally {
    process.chdir(originalDirectory);
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('rejects context assembled from unrelated prework', () => {
  const makeEvidence = (subject) => createReleaseEvidence({
    fromTag: 'v0.18.1',
    fromSha: '1'.repeat(40),
    toTag: 'v0.19.0',
    toSha: '2'.repeat(40),
    mergeBaseSha: '1'.repeat(40),
    commits: [{sha: '2'.repeat(40), subject}],
    files: [{status: 'modified', path: 'src/cli/backend.rs'}],
  });
  const evidence = makeEvidence('First comparison');
  const unrelatedPrework = createReleasePrework({
    evidence: makeEvidence('Different comparison'),
    diff: '+command.arg("--backend")\n',
  });

  assert.throws(
    () => createReleaseAiContext({
      evidence,
      prework: unrelatedPrework,
      doctorCapture: createReleaseDoctorCapture({
        tag: 'v0.19.0',
        commitSha: evidence.to.sha,
        packageVersion: '0.19.0',
        exitCode: 0,
        stdout: 'CRADLE v0.19.0 — dependency check\nAll dependencies installed.\n',
        stderr: '',
      }),
      previousReleaseNote: {path: 'previous.md', content: '', truncated: false},
      upstreamFiles: [],
      documentationFiles: [],
    }),
    /prework does not match its release evidence/,
  );
});
