import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import ts from 'typescript';
import {load} from 'js-yaml';
import {importScenarioBundle} from './import-scenario-bundle.mjs';
import {generateLibrary} from './generate-library.mjs';
import {selectBundleArtifact, sourceRepository, sourceRunId, verifySourceRun} from './scenario-sync-source.mjs';

const revision = 'a'.repeat(40);
const runId = 1234;
const yaml = value => Object.entries(value).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
function bundle(entries = [{id: 'railway', draft: false}, {id: 'unfinished', draft: true}]) {
  const catalog = entries.map(({id, draft}) => ({id, sourceUrl: `https://github.com/${sourceRepository}/tree/${revision}/scenarios/${id}`, title: `Example ${id}`, description: 'Example scenario', source: 'Community', category: 'Networking', tags: ['Linux', 'Training'], requirements: 'Ubuntu host', draft, searchText: `${id} ubuntu host cve-2021-41773 distinctive article`}));
  return {
    schemaVersion: 1, sourceRepository, sourceRevision: revision, catalog,
    scenarios: catalog.map(({id, searchText, ...metadata}) => ({id, spec: 'metadata() > name("Example").\ninstance("host") > heuristic("cve", "CVE-2021-41773").\n', article: `---\n${yaml(metadata)}\n---\n\nDistinctive article.\n\n[Download](./scenario.cradle).\n`})),
  };
}
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'scenario-sync-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  return root;
}
const importInto = (root, value = bundle()) => importScenarioBundle({root, bundle: value, expectedRevision: revision, runId});

test('trusts only successful source-main push validations and exact commit payloads', () => {
  const run = {repository: {full_name: sourceRepository}, head_repository: {full_name: sourceRepository}, path: '.github/workflows/validate.yml', head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success', head_sha: revision};
  assert.equal(verifySourceRun(run, {requestedRepository: sourceRepository, requestedSha: revision}), revision);
  for (const patch of [{event: 'pull_request'}, {event: 'workflow_dispatch'}, {head_branch: 'feature'}, {path: '.github/workflows/other.yml'}, {conclusion: 'failure'}, {status: 'in_progress'}, {head_repository: {full_name: 'attacker/fork'}}, {repository: {full_name: 'attacker/repo'}}]) assert.throws(() => verifySourceRun({...run, ...patch}));
  assert.throws(() => verifySourceRun(run, {requestedSha: 'b'.repeat(40)}), /commit/);
  assert.throws(() => verifySourceRun(run, {requestedRepository: 'attacker/repo'}), /trusted/);
  assert.equal(sourceRunId('1234'), 1234);
  for (const value of ['0', '-1', '1;echo', '1.5', '9007199254740992', undefined]) assert.throws(() => sourceRunId(value));
  const artifact = {id: 1, name: 'website-scenarios', expired: false, size_in_bytes: 1024};
  assert.deepEqual(selectBundleArtifact([artifact]), artifact);
  for (const artifacts of [[], [artifact, artifact], [{...artifact, expired: true}], [{...artifact, size_in_bytes: 21 * 1024 * 1024}]]) assert.throws(() => selectBundleArtifact(artifacts));
});

test('imports files and searchable metadata, preserves drafts/assets, and repeats without changes', async t => {
  const root = await fixture(t);
  const folder = path.join(root, 'library/scenarios/railway');
  await mkdir(folder, {recursive: true});
  await writeFile(path.join(folder, 'README.md'), '---\nentrypoint: Custom.cradle\n---\nOriginal readme\n');
  await writeFile(path.join(folder, 'Custom.cradle'), 'old specification');
  await writeFile(path.join(folder, 'preview.svg'), '<svg/>');
  await mkdir(path.join(root, 'library/scenarios/manual'), {recursive: true});
  await writeFile(path.join(root, 'library/scenarios/manual/index.md'), '---\ndraft: true\n---\nManual entry');
  const value = bundle();
  const result = await importInto(root, value);
  assert.equal(result.changedFiles, 5);
  const database = JSON.parse(await readFile(path.join(root, 'library/scenario-library.json'), 'utf8'));
  assert.equal(database.sourceRevision, revision);
  assert.equal(database.sourceRunId, runId);
  assert.deepEqual(database.catalog.map(({id}) => id), ['railway', 'unfinished']);
  assert.equal(await readFile(path.join(folder, 'scenario.cradle'), 'utf8'), value.scenarios[0].spec);
  assert.match(await readFile(path.join(folder, 'index.md'), 'utf8'), /entrypoint: scenario\.cradle/);
  assert.equal(await readFile(path.join(folder, 'preview.svg'), 'utf8'), '<svg/>');
  assert.equal(await readFile(path.join(folder, 'Custom.cradle'), 'utf8'), 'old specification');
  assert.match(await readFile(path.join(root, 'library/scenarios/manual/index.md'), 'utf8'), /Manual entry/);
  const publicDatabase = await generateLibrary(root);
  assert.deepEqual(publicDatabase.scenarios.map(({id}) => id), ['railway']);
  assert.equal(publicDatabase.scenarios[0].sourcePath, 'library/scenarios/railway/scenario.cradle');
  assert.equal(publicDatabase.scenarios[0].spec, value.scenarios[0].spec);
  assert.equal(publicDatabase.scenarios[0].sourceUrl, value.catalog[0].sourceUrl);
  assert.equal(publicDatabase.scenarios[0].searchText, value.catalog[0].searchText);
  assert.equal((await importInto(root, value)).changedFiles, 0);
});

test('an all-draft or empty source snapshot produces a valid empty public database', async t => {
  const root = await fixture(t);
  await importInto(root, bundle([{id: 'draft-example', draft: true}]));
  assert.deepEqual((await generateLibrary(root)).scenarios, []);
  const empty = await fixture(t);
  assert.equal((await importInto(empty, bundle([]))).manifest.catalog.length, 0);
  assert.deepEqual((await generateLibrary(empty)).scenarios, []);
});

test('rejects inconsistent or unsafe bundles before changing any destination files', async t => {
  const root = await fixture(t);
  const mutations = [
    value => {value.sourceRepository = 'attacker/repo';},
    value => {value.sourceRevision = 'b'.repeat(40);},
    value => {value.schemaVersion = 2;},
    value => {value.scenarios[1].id = '../escape';},
    value => {value.scenarios[1].id = 'validation-smoke-test';},
    value => {value.scenarios[1].id = 'railway';},
    value => {value.catalog[1].id = 'railway';},
    value => {value.catalog[1].id = 'different';},
    value => {value.catalog[1].title = 'Mismatch';},
    value => {value.catalog[1].sourceUrl = 'https://example.com';},
    value => {value.catalog[1].draft = false;},
    value => {value.scenarios[1].article = value.scenarios[1].article.replace('---\n', '---\nentrypoint: Custom.cradle\n');},
  ];
  for (const mutate of mutations) {
    const value = bundle();
    mutate(value);
    await assert.rejects(importInto(root, value));
    assert.deepEqual(await readdir(root), []);
  }
  await mkdir(path.join(root, 'library/scenarios/railway'), {recursive: true});
  await writeFile(path.join(root, 'library/scenarios/railway/index.mdx'), 'Existing MDX article');
  await assert.rejects(importInto(root), /index.mdx conflicts/);
  assert.deepEqual(await readdir(path.join(root, 'library/scenarios/railway')), ['index.mdx']);
});

test('refuses symlinked destination folders and files', async t => {
  const root = await fixture(t);
  const outside = await fixture(t);
  await mkdir(path.join(root, 'library/scenarios'), {recursive: true});
  await symlink(outside, path.join(root, 'library/scenarios/railway'), 'dir');
  await assert.rejects(importInto(root), /symbolic links/);
  assert.deepEqual(await readdir(outside), []);
  await rm(path.join(root, 'library/scenarios/railway'));
  await mkdir(path.join(root, 'library/scenarios/railway'));
  await writeFile(path.join(outside, 'spec'), 'preserve');
  await symlink(path.join(outside, 'spec'), path.join(root, 'library/scenarios/railway/scenario.cradle'));
  await assert.rejects(importInto(root), /symbolic links/);
  assert.equal(await readFile(path.join(outside, 'spec'), 'utf8'), 'preserve');
});

test('search supports catalog terms, case/Unicode normalization, and manual scenario fallback', async () => {
  const source = await readFile(new URL('../src/components/collection/search.ts', import.meta.url), 'utf8');
  const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
  const {matchesScenarioSearch} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  const scenario = {...bundle().catalog[0], name: 'Railway'};
  assert.equal(matchesScenarioSearch(scenario, 'ＣＶＥ-2021-41773  Ubuntu'), true);
  assert.equal(matchesScenarioSearch(scenario, 'distinctive missing'), false);
  assert.equal(matchesScenarioSearch(scenario, '   '), true);
  const {searchText, ...manual} = scenario;
  assert.equal(matchesScenarioSearch(manual, 'networking Linux'), true);
});

test('receiver wiring uses verified artifact IDs, freshness checks, scoped commits and a review PR', async () => {
  const workflow = load(await readFile(new URL('../.github/workflows/sync-scenario-library.yml', import.meta.url), 'utf8'));
  assert.deepEqual(workflow.on.repository_dispatch.types, ['scenario-library-updated']);
  const steps = workflow.jobs.sync.steps;
  const download = steps.find(step => step.uses === 'actions/download-artifact@v4');
  assert.equal(download.with.repository, sourceRepository);
  assert.ok(download.with['artifact-ids'].includes('steps.source.outputs.artifact-id'));
  assert.equal(steps.find(step => step.id === 'review').with.branch, 'scenario-library-sync');
  assert.equal(steps.find(step => step.id === 'review').if, "steps.freshness.outputs.current == 'true'");
  assert.ok(steps.find(step => step.id === 'review').with['add-paths'].includes('library/scenario-library.json'));
  assert.ok(steps.find(step => step.id === 'freshness').with.script.includes('branch.commit.sha === process.env.SOURCE_SHA'));
});
