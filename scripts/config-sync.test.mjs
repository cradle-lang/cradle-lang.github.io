import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm, symlink, readdir} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {load} from 'js-yaml';
import {importConfigBundle} from './import-config-bundle.mjs';
import {readLibrary} from './generate-library.mjs';
import {configRepository, configRunId, verifyConfigRun, selectConfigArtifact} from './config-sync-source.mjs';
const revision = 'a'.repeat(40), id = 'linux-example', module = 'linux-example';
function bundle(draft = false) {
  const sourceUrl = `https://github.com/${configRepository}/tree/${revision}/configs/${module}`;
  return {schemaVersion: 1, sourceRepository: configRepository, sourceRevision: revision, entries: [{id, module, sourceUrl, article: `---\ntitle: Example configuration\ndescription: Example module\nconfig: ${module}\nos: Linux\ncategory: Networking\ndraft: ${draft}\nsourceUrl: ${sourceUrl}\n---\n\nModule article.\n`}]};
}
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'config-receiver-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  return root;
}
const receive = (root, value = bundle()) => importConfigBundle({siteRoot: root, bundle: value, expectedRevision: revision, runId: 123});

test('trusts only successful full main validation, including manual recovery; rejects PR/fork/workflow substitutions', () => {
  const run = {repository: {full_name: configRepository}, head_repository: {full_name: configRepository}, path: '.github/workflows/validate-configs.yml', head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success', head_sha: revision};
  assert.equal(verifyConfigRun(run), revision);
  assert.equal(verifyConfigRun({...run, event: 'workflow_dispatch'}), revision);
  for (const patch of [{event: 'pull_request'}, {head_branch: 'feature'}, {head_repository: {full_name: 'someone/fork'}}, {path: '.github/workflows/other.yml'}, {conclusion: 'failure'}, {status: 'in_progress'}]) assert.throws(() => verifyConfigRun({...run, ...patch}));
  assert.throws(() => verifyConfigRun(run, {repository: 'attacker/repo'}));
  assert.throws(() => verifyConfigRun(run, {revision: 'b'.repeat(40)}));
  for (const input of [0, -1, '1.1', '2;echo', undefined]) assert.throws(() => configRunId(input));
  const artifact = {id: 1, name: 'website-configurations', expired: false, size_in_bytes: 100};
  assert.equal(selectConfigArtifact([artifact]), artifact);
  for (const list of [[], [artifact, artifact], [{...artifact, expired: true}], [{...artifact, size_in_bytes: 21 * 1024 * 1024}]]) assert.throws(() => selectConfigArtifact(list));
});

test('imports published/draft articles and source links, migrates legacy configurations and repeats without changes', async t => {
  const root = await fixture(t), folder = path.join(root, 'library/configurations', id);
  await mkdir(folder, {recursive: true});
  await writeFile(path.join(folder, 'index.md'), bundle().entries[0].article);
  await writeFile(path.join(folder, 'attachment.txt'), 'Keep source asset');
  await receive(root);
  assert.equal((await readLibrary(root)).configurations[0].sourceUrl, bundle().entries[0].sourceUrl);
  const before = await readFile(path.join(folder, 'index.md'), 'utf8');
  await receive(root);
  assert.equal(await readFile(path.join(folder, 'index.md'), 'utf8'), before);
  assert.equal(await readFile(path.join(folder, 'attachment.txt'), 'utf8'), 'Keep source asset');
  await receive(root, bundle(true));
  assert.deepEqual((await readLibrary(root)).configurations, []);
});

test('removals retire only managed configurations; manual configurations and heuristics remain', async t => {
  const root = await fixture(t);
  await receive(root);
  await mkdir(path.join(root, 'library/configurations/manual'), {recursive: true});
  await writeFile(path.join(root, 'library/configurations/manual/index.md'), '---\ntitle: Manual\ndescription: Manual config\nconfig: manual\nos: Unspecified\n---\n\nManual content\n');
  await mkdir(path.join(root, 'library/heuristics/ttp-t1105'), {recursive: true});
  await writeFile(path.join(root, 'library/heuristics/ttp-t1105/index.md'), '---\ntitle: TTP\ndescription: Manual heuristic\nframework: ttp\nidentifier: T1105\n---\n\nManual heuristic\n');
  const result = await receive(root, {...bundle(), entries: []});
  assert.deepEqual(result.retired, [id]);
  assert.deepEqual((await readLibrary(root)).configurations.map(x => x.id), ['manual']);
  assert.equal((await readLibrary(root)).heuristics[0].id, 'ttp-t1105');
  await receive(root);
  assert.equal((await readLibrary(root)).configurations.length, 2);
});

test('rejects malformed metadata, duplicate IDs, traversal and provenance mismatches before writing', async t => {
  const mutations = [
    value => {value.sourceRevision = 'b'.repeat(40);},
    value => {value.entries[0].id = '../escape';},
    value => {value.entries[0].module = 'linux-other';},
    value => {value.entries.push(value.entries[0]);},
    value => {value.entries[0].sourceUrl = 'https://attacker.example';},
    value => {value.entries[0].article = value.entries[0].article.replace('draft: false', 'draft: false\ndraft: true');},
    value => {value.entries[0].article = value.entries[0].article.replace('config: linux-example', 'config: unrelated');},
    value => {value.entries[0].article = value.entries[0].article.replace('draft: false', 'draft: false\nslug: /unrelated');},
  ];
  for (const mutate of mutations) {
    const root = await fixture(t), value = bundle(); mutate(value);
    await assert.rejects(receive(root, value)); assert.deepEqual(await readdir(root), []);
  }
});

test('rejects destination junctions/symlinks and conflicting MDX before modifying content', async t => {
  const root = await fixture(t), outside = await fixture(t);
  await mkdir(path.join(root, 'library/configurations'), {recursive: true});
  await symlink(outside, path.join(root, 'library/configurations', id), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(receive(root), /Unsafe/); assert.deepEqual(await readdir(outside), []);
  const other = await fixture(t);
  await mkdir(path.join(other, 'library/configurations', id), {recursive: true});
  await writeFile(path.join(other, 'library/configurations', id, 'index.mdx'), 'Existing MDX');
  await assert.rejects(receive(other), /index.mdx/);
});

test('workflow verifies exact artifacts and freshness, scopes writes, and builds before opening the PR', async () => {
  const workflow = load(await readFile(new URL('../.github/workflows/sync-config-library.yml', import.meta.url), 'utf8'));
  const steps = workflow.jobs.sync.steps;
  assert.ok(steps.find(step => step.id === 'source').with.script.includes('verifyConfigRun'));
  assert.match(steps.find(step => step.id === 'source').with.script, /repo: 'cradle-lib'/);
  assert.match(steps.find(step => step.id === 'freshness').with.script, /repo: 'cradle-lib'/);
  assert.equal(steps.find(step => step.uses?.startsWith('actions/download-artifact')).with.repository, 'cradle-lang/cradle-lib');
  assert.deepEqual(workflow.on.repository_dispatch.types, ['configuration-library-updated']);
  assert.ok(steps.find(step => step.uses?.startsWith('actions/download-artifact')).with['artifact-ids']);
  const build = steps.findIndex(step => step.run?.includes('npm run build'));
  const review = steps.findIndex(step => step.uses?.startsWith('peter-evans/create-pull-request'));
  assert.ok(build > 0 && review > build);
  assert.equal(steps[review].if, "steps.freshness.outputs.current == 'true'");
  assert.equal(steps[review].with.branch, 'configuration-library-sync');
  assert.match(steps[review].with['add-paths'], /library\/configurations\/\*\/index.md/);
  assert.doesNotMatch(steps[review].with['add-paths'], /heuristics|scenarios/);
});

test('mixed-case module names preserve config identity and map to existing lowercase routes', async t => {
  const root = await fixture(t), value = bundle(), name = 'win-tellerApp';
  value.entries[0] = {...value.entries[0], id: 'win-tellerapp', module: name,
    sourceUrl: value.entries[0].sourceUrl.replaceAll(module, name),
    article: value.entries[0].article.replaceAll(module, name)};
  await receive(root, value);
  const entries = (await readLibrary(root)).configurations;
  assert.equal(entries[0].id, 'win-tellerapp');
  assert.equal(entries[0].key, name);
  const bad = structuredClone(value); bad.entries[0].id = 'win-tellerApp';
  await assert.rejects(receive(root, bad), /identity/);
});
