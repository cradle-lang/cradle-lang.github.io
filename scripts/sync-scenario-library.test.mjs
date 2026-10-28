import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {syncScenarioLibrary, validateBundle} from './sync-scenario-library.mjs';

const revision = 'a'.repeat(40);
const article = '---\ntitle: Railway\ndescription: Synced article\ndraft: true\n---\n\n[Source](./scenario.cradle)\n';
const bundle = () => ({schemaVersion: 1, sourceRepository: 'mashmllo/scenario_library', sourceRevision: revision, scenarios: [{id: 'railway', spec: 'metadata() > name("Railway").\n', article}]});
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'website-sync-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  await mkdir(path.join(root, 'library/scenarios/railway/configs'), {recursive: true});
  await mkdir(path.join(root, 'library/scenarios/unrelated'), {recursive: true});
  await writeFile(path.join(root, 'library/scenarios/railway/index.mdx'), 'old article');
  await writeFile(path.join(root, 'library/scenarios/railway/configs/setup.yml'), 'old config');
  await writeFile(path.join(root, 'library/scenarios/unrelated/keep.txt'), 'Keep');
  return root;
}

test('replaces a synced folder with exactly the two requested files and keeps unrelated entries', async (t) => {
  const root = await fixture(t);
  const snapshot = bundle();
  assert.deepEqual(await syncScenarioLibrary(snapshot, {websiteRoot: root, expectedRevision: revision}), ['railway']);
  assert.deepEqual((await readdir(path.join(root, 'library/scenarios/railway'))).sort(), ['index.md', 'scenario.cradle']);
  assert.equal(await readFile(path.join(root, 'library/scenarios/railway/scenario.cradle'), 'utf8'), snapshot.scenarios[0].spec);
  assert.equal(await readFile(path.join(root, 'library/scenarios/railway/index.md'), 'utf8'), article);
  assert.equal(await readFile(path.join(root, 'library/scenarios/unrelated/keep.txt'), 'utf8'), 'Keep');
  assert.equal(JSON.parse(await readFile(path.join(root, '.github/scenario-library-source.json'), 'utf8')).sourceRevision, revision);
  assert.deepEqual(await syncScenarioLibrary(snapshot, {websiteRoot: root, expectedRevision: revision}), []);
});

test('checks source identity and revision before writing any destination content', async (t) => {
  const root = await fixture(t);
  for (const change of [{sourceRepository: 'other/repo'}, {sourceRevision: 'b'.repeat(40)}, {schemaVersion: 99}]) {
    await assert.rejects(syncScenarioLibrary({...bundle(), ...change}, {websiteRoot: root, expectedRevision: revision}), /does not match/);
    assert.equal(await readFile(path.join(root, 'library/scenarios/railway/index.mdx'), 'utf8'), 'old article');
  }
});

test('rejects traversal, duplicate IDs, malformed articles and thumbnail assets', async () => {
  const invalid = [
    {...bundle(), scenarios: [{id: '../outside', spec: 'source', article}]},
    {...bundle(), scenarios: [...bundle().scenarios, ...bundle().scenarios]},
    {...bundle(), scenarios: [{id: 'railway', spec: 'source', article: 'No YAML'}]},
    {...bundle(), scenarios: [{id: 'railway', spec: 'source', article: article.replace('draft: true', 'draft: true\nthumbnail: ./image.png')}]},
  ];
  for (const snapshot of invalid) await assert.rejects(validateBundle(snapshot, revision));
});

test('an empty snapshot does not remove existing website entries', async (t) => {
  const root = await fixture(t);
  assert.deepEqual(await syncScenarioLibrary({...bundle(), scenarios: []}, {websiteRoot: root, expectedRevision: revision}), []);
  assert.equal(await readFile(path.join(root, 'library/scenarios/railway/index.mdx'), 'utf8'), 'old article');
});
