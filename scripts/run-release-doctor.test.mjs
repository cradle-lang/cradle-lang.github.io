import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const SHA = '1919191919191919191919191919191919191919';

async function executable(filePath, content) {
  await fs.writeFile(filePath, content, {mode: 0o755});
}

test('captures a completed nonzero doctor diagnostic in a normalized environment', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-doctor-cli-'),
  );
  try {
    const repositoryDirectory = path.join(directory, 'upstream');
    const fakeBin = path.join(directory, 'bin');
    const targetDirectory = path.join(directory, 'target');
    await Promise.all([
      fs.mkdir(repositoryDirectory),
      fs.mkdir(fakeBin),
      fs.mkdir(path.join(targetDirectory, 'release'), {recursive: true}),
    ]);
    await executable(
      path.join(fakeBin, 'cargo'),
      `#!/bin/sh
if [ "$1" = metadata ]; then
  printf '%s\\n' '{"packages":[{"name":"cradle-cli","version":"0.19.0","targets":[{"name":"cxc","kind":["bin"]}]}],"target_directory":"${targetDirectory}"}'
  exit 0
fi
printf '%s\\n' "$TEST_TOKEN" >&2
target_dir=''
previous=''
for argument in "$@"; do
  if [ "$previous" = '--target-dir' ]; then target_dir="$argument"; fi
  previous="$argument"
done
mkdir -p "$target_dir/debug"
cp '${path.join(targetDirectory, 'release', 'cxc')}' "$target_dir/debug/cxc"
exit 0
`,
    );
    await executable(
      path.join(fakeBin, 'git'),
      `#!/bin/sh
printf '%s\\n' '${SHA}'
`,
    );
    await executable(
      path.join(targetDirectory, 'release', 'cxc'),
      `#!/bin/sh
printf '%s\\n' 'CRADLE v0.19.0 — dependency check'
printf '%s\\n' 'Configuration:'
printf '  Config file: %s\\n' "$HOME/.cxc/config.toml"
printf '%s\\n' 'Missing required dependencies.'
exit 1
`,
    );

    const outputPath = path.join(directory, 'doctor.json');
    const diagnosticPath = path.join(directory, 'doctor.log');
    const githubOutput = path.join(directory, 'github-output');
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/run-release-doctor.mjs'),
        repositoryDirectory,
        'v0.19.0',
        SHA,
        outputPath,
        diagnosticPath,
      ],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${fakeBin}:${process.env.PATH}`,
          GITHUB_OUTPUT: githubOutput,
          TEST_TOKEN: 'private-token-value',
        },
      },
    );

    assert.equal(result.status, 0, result.stderr);
    const capture = JSON.parse(await fs.readFile(outputPath, 'utf8'));
    assert.equal(capture.exitCode, 1);
    assert.match(capture.stdout, /<TEMP>\/home\/\.cxc\/config\.toml/);
    assert.doesNotMatch(capture.stdout, new RegExp(os.userInfo().username, 'u'));
    assert.match(await fs.readFile(githubOutput, 'utf8'), /exit_code=1/);
    const diagnostic = await fs.readFile(diagnosticPath, 'utf8');
    assert.match(diagnostic, /\$ cxc doctor/);
    assert.match(diagnostic, /<REDACTED>/);
    assert.doesNotMatch(diagnostic, /private-token-value/);
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});
