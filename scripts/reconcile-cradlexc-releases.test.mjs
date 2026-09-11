import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const CLI_PATH = fileURLToPath(
  new URL('./reconcile-cradlexc-releases.mjs', import.meta.url),
);

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';
const SHA_20 = '2020202020202020202020202020202020202020';

function runCli(arguments_, environment = {}) {
  return spawnSync(
    process.execPath,
    [CLI_PATH, ...arguments_],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_OUTPUT: '',
        ...environment,
      },
    },
  );
}

test('reports the oldest outstanding release and writes GitHub outputs', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-reconcile-cli-'),
  );

  try {
    const upstreamTagsFile = path.join(directory, 'upstream-tags.txt');
    const releaseNotesDirectory = path.join(directory, 'release-notes');
    const githubOutput = path.join(directory, 'github-output.txt');

    await fs.mkdir(releaseNotesDirectory);
    await Promise.all([
      fs.writeFile(
        upstreamTagsFile,
        [
          `v0.20.0\t${SHA_20}`,
          `v0.16.0\t1616161616161616161616161616161616161616`,
          `v0.18.1\t${SHA_18}`,
          `v0.19.0\t${SHA_19}`,
          `invalid\t9999999999999999999999999999999999999999`,
          '',
        ].join('\n'),
      ),
      fs.writeFile(
        path.join(releaseNotesDirectory, 'v0.18.1.md'),
        '# Release 0.18.1\n',
      ),
    ]);

    const result = runCli(
      [upstreamTagsFile, releaseNotesDirectory],
      {GITHUB_OUTPUT: githubOutput},
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Selected release: v0\.19\.0/);
    assert.equal(
      await fs.readFile(githubOutput, 'utf8'),
      [
        'has_outstanding=true',
        'selected=v0.19.0',
        `selected_sha=${SHA_19}`,
        'selected_state=QUEUED',
        'should_dispatch=true',
        'eligible=["v0.18.1","v0.19.0","v0.20.0"]',
        'completed=["v0.18.1"]',
        'outstanding=["v0.19.0","v0.20.0"]',
        `queue=[{"tag":"v0.18.1","sha":"${SHA_18}","state":"COMPLETED"},{"tag":"v0.19.0","sha":"${SHA_19}","state":"QUEUED"},{"tag":"v0.20.0","sha":"${SHA_20}","state":"QUEUED"}]`,
        '',
      ].join('\n'),
    );
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('writes no-work outputs when every eligible release is completed', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-reconcile-complete-'),
  );

  try {
    const upstreamTagsFile = path.join(directory, 'upstream-tags.txt');
    const releaseNotesDirectory = path.join(directory, 'release-notes');
    const githubOutput = path.join(directory, 'github-output.txt');

    await fs.mkdir(releaseNotesDirectory);
    await Promise.all([
      fs.writeFile(upstreamTagsFile, `v0.18.1\t${SHA_18}\n`),
      fs.writeFile(
        path.join(releaseNotesDirectory, 'v0.18.1.md'),
        '# Release 0.18.1\n',
      ),
    ]);

    const result = runCli(
      [upstreamTagsFile, releaseNotesDirectory],
      {GITHUB_OUTPUT: githubOutput},
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Selected release: none/);

    const output = await fs.readFile(githubOutput, 'utf8');
    assert.match(output, /^has_outstanding=false$/m);
    assert.match(output, /^selected=$/m);
    assert.match(output, /^selected_sha=$/m);
    assert.match(output, /^selected_state=$/m);
    assert.match(output, /^should_dispatch=false$/m);
    assert.match(output, /^outstanding=\[\]$/m);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('persists queue states and blocks FIFO dispatch for an open PR', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-reconcile-states-'),
  );

  try {
    const upstreamTagsFile = path.join(directory, 'upstream-tags.txt');
    const releaseNotesDirectory = path.join(directory, 'release-notes');
    const signalsFile = path.join(directory, 'signals.json');
    const queueOutputFile = path.join(directory, 'queue.json');
    const githubOutput = path.join(directory, 'github-output.txt');
    const stepSummary = path.join(directory, 'summary.md');

    await fs.mkdir(releaseNotesDirectory);
    await Promise.all([
      fs.writeFile(
        upstreamTagsFile,
        [
          `v0.18.1\t${SHA_18}`,
          `v0.19.0\t${SHA_19}`,
          `v0.20.0\t${SHA_20}`,
          '',
        ].join('\n'),
      ),
      fs.writeFile(
        path.join(releaseNotesDirectory, 'v0.18.1.md'),
        '# Release 0.18.1\n',
      ),
      fs.writeFile(
        signalsFile,
        JSON.stringify({openPullRequestTags: ['v0.19.0']}),
      ),
    ]);

    const result = runCli(
      [
        upstreamTagsFile,
        releaseNotesDirectory,
        signalsFile,
        queueOutputFile,
      ],
      {GITHUB_OUTPUT: githubOutput, GITHUB_STEP_SUMMARY: stepSummary},
    );

    assert.equal(result.status, 0, result.stderr);
    const output = await fs.readFile(githubOutput, 'utf8');
    assert.match(output, /^selected=v0\.19\.0$/m);
    assert.match(output, /^selected_state=PR_OPEN$/m);
    assert.match(output, /^should_dispatch=false$/m);

    const snapshot = JSON.parse(await fs.readFile(queueOutputFile, 'utf8'));
    assert.equal(snapshot.schemaVersion, 1);
    assert.equal(snapshot.selected.state, 'PR_OPEN');
    assert.equal(snapshot.releases[2].state, 'QUEUED');
    assert.match(
      await fs.readFile(stepSummary, 'utf8'),
      /\| v0\.19\.0 \| `[0-9a-f]+` \| PR_OPEN \|/,
    );
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('fails with usage guidance when the tag-file argument is missing', () => {
  const result = runCli([]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node/);
});

test('fails when the upstream tag file is empty', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-reconcile-empty-'),
  );

  try {
    const upstreamTagsFile = path.join(directory, 'upstream-tags.txt');
    const releaseNotesDirectory = path.join(directory, 'release-notes');

    await fs.writeFile(upstreamTagsFile, '\n  \n');
    await fs.mkdir(releaseNotesDirectory);

    const result = runCli([upstreamTagsFile, releaseNotesDirectory]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /inventory is empty/);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('fails when the release-notes directory does not exist', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-reconcile-missing-'),
  );

  try {
    const upstreamTagsFile = path.join(directory, 'upstream-tags.txt');
    await fs.writeFile(upstreamTagsFile, `v0.18.1\t${SHA_18}\n`);

    const result = runCli([
      upstreamTagsFile,
      path.join(directory, 'missing-release-notes'),
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /ENOENT/);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});

test('fails when an upstream release has a malformed commit SHA', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-reconcile-sha-'),
  );

  try {
    const upstreamTagsFile = path.join(directory, 'upstream-tags.txt');
    const releaseNotesDirectory = path.join(directory, 'release-notes');

    await fs.writeFile(upstreamTagsFile, 'v0.19.0\tnot-a-sha\n');
    await fs.mkdir(releaseNotesDirectory);

    const result = runCli([upstreamTagsFile, releaseNotesDirectory]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid upstream release inventory line/);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});
