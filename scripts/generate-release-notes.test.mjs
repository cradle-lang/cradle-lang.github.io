import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const generatorPath = path.resolve('scripts/generate-release-notes.mjs');

async function writeRelease(directory, version) {
  await fs.writeFile(
    path.join(directory, 'release-notes', `v${version}.md`),
    `# Announcing CradleXC ${version}\n`,
  );
}

test('archives release notes without changing the generated current index', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradle-release-notes-'),
  );

  try {
    await Promise.all([
      fs.mkdir(path.join(directory, 'release-notes'), {recursive: true}),
      fs.mkdir(path.join(directory, 'src', 'data'), {recursive: true}),
    ]);
    await Promise.all([
      writeRelease(directory, '0.18.1'),
      writeRelease(directory, '0.19.0'),
      fs.writeFile(
        path.join(directory, 'src', 'data', 'release-notes.json'),
        '[]\n',
      ),
    ]);

    await execFileAsync(
      process.execPath,
      [generatorPath, '--snapshot', '0.18.1'],
      {cwd: directory},
    );

    const snapshot = JSON.parse(
      await fs.readFile(
        path.join(directory, 'src', 'data', 'release-notes.json'),
        'utf8',
      ),
    );

    assert.deepEqual(snapshot.current, []);
    assert.deepEqual(
      snapshot.versions['0.18.1'].map(({version}) => version),
      ['v0.18.1'],
    );

    await execFileAsync(process.execPath, [generatorPath], {cwd: directory});

    const generated = JSON.parse(
      await fs.readFile(
        path.join(directory, 'src', 'data', 'release-notes.json'),
        'utf8',
      ),
    );

    assert.deepEqual(
      generated.current.map(({version}) => version),
      ['v0.18.1', 'v0.19.0'],
    );
    assert.deepEqual(
      generated.versions['0.18.1'].map(({version}) => version),
      ['v0.18.1'],
    );
  } finally {
    await fs.rm(directory, {recursive: true, force: true});
  }
});
