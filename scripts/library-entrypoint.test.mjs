import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {generateLibrary, readLibrary} from './generate-library.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const metadata = {title: 'Named range', description: 'Custom source filename', source: 'Test', category: 'Training', tags: ['Test'], requirements: 'None'};
async function fixture(t, {entrypoint, readme, files = ['scenario.cradle']} = {}) {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-entrypoint-'));
  t.after(() => rm(temporary, {recursive: true, force: true}));
  const directory = path.join(temporary, 'library/scenarios/named-range');
  await mkdir(directory, {recursive: true});
  await writeFile(path.join(directory, 'index.md'), `---\n${JSON.stringify({...metadata, entrypoint})}\n---\n\nA scenario.\n`);
  if (readme !== undefined) await writeFile(path.join(directory, 'README.md'), `---\n${JSON.stringify({entrypoint: readme})}\n---\n`);
  for (const file of files) {
    await mkdir(path.dirname(path.join(directory, file)), {recursive: true});
    await writeFile(path.join(directory, file), `// ${file}\nmetadata() > name("NamedRange").\n`);
  }
  return {temporary, directory};
}

test('selects article, README, canonical and unique entrypoints in order', async (t) => {
  for (const [name, options, expected] of [
    ['article overrides README and default', {entrypoint: 'specs/My Range.cradle', readme: 'Other.cradle', files: ['scenario.cradle', 'Other.cradle', 'specs/My Range.cradle']}, 'specs/My Range.cradle'],
    ['README overrides default', {readme: 'HelloWorld.cradle', files: ['scenario.cradle', 'HelloWorld.cradle']}, 'HelloWorld.cradle'],
    ['default wins over other files', {files: ['scenario.cradle', 'Extra.cradle']}, 'scenario.cradle'],
    ['unique custom filename', {files: ['HelloWorld.cradle']}, 'HelloWorld.cradle'],
  ]) await t.test(name, async (t) => {
    const {temporary, directory} = await fixture(t, options);
    const {scenarios: [scenario]} = await generateLibrary(temporary);
    assert.equal(scenario.file, path.posix.basename(expected));
    assert.equal(scenario.sourcePath, `library/scenarios/named-range/${expected}`);
    assert.equal(scenario.spec, await readFile(path.join(directory, expected), 'utf8'));
    const assets = await readFile(path.join(temporary, 'src/data/library-assets.generated.ts'), 'utf8');
    assert.ok(assets.includes(`../../library/scenarios/named-range/${expected}`));
    const resolved = spawnSync(process.execPath, [path.join(root, 'scripts/resolve-library-scenario.mjs'), 'named-range', temporary], {encoding: 'utf8'});
    assert.equal(resolved.status, 0, resolved.stderr);
    assert.equal(resolved.stdout.trim(), path.join(directory, expected));
  });
});

test('rejects invalid explicit entrypoints instead of falling back', async (t) => {
  for (const entrypoint of ['Missing.cradle', '../escape.cradle', '/tmp/escape.cradle', 'C:\\escape.cradle', 'specs\\main.cradle', 'file.txt', 'main.cradle?raw', '', null, 42]) {
    await t.test(String(entrypoint), async (t) => {
      const {temporary} = await fixture(t, {entrypoint});
      await assert.rejects(readLibrary(temporary), /entrypoint/);
    });
  }
});

test('requires an explicit choice when multiple custom sources exist', async (t) => {
  const {temporary} = await fixture(t, {files: ['First.cradle', 'Second.cradle']});
  await assert.rejects(readLibrary(temporary), /set entrypoint/);
});

test('rejects a source symlink outside the scenario folder', async (t) => {
  const {temporary, directory} = await fixture(t, {entrypoint: 'Outside.cradle'});
  const outside = path.join(temporary, 'Outside.cradle');
  await writeFile(outside, 'outside');
  await symlink(outside, path.join(directory, 'Outside.cradle'));
  await assert.rejects(readLibrary(temporary), /inside this scenario folder/);
});

test('rejects an empty selected specification', async (t) => {
  const {temporary, directory} = await fixture(t, {entrypoint: 'Empty.cradle'});
  await writeFile(path.join(directory, 'Empty.cradle'), ' \n');
  await assert.rejects(readLibrary(temporary), /Empty.cradle must not be empty/);
});
