import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm, symlink, readdir} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {load} from 'js-yaml';
import {importTtpBundle} from './import-ttp-bundle.mjs';
import {readLibrary} from './generate-library.mjs';
import {ttpRepository, ttpRunId, verifyTtpRun, selectTtpArtifact} from './ttp-sync-source.mjs';
const revision = 'a'.repeat(40), id = 'ttp-t1105', module = 'T1105';
function bundle(draft = false) {
  const sourceUrl = `https://github.com/${ttpRepository}/tree/${revision}/heuristics/ttp/${module}`;
  return {schemaVersion: 1, sourceRepository: ttpRepository, sourceRevision: revision, entries: [{id, module, sourceUrl, article: `---\ntitle: Example TTP\ndescription: Example module\nframework: ttp\nidentifier: ${module}\ndraft: ${draft}\nsourceUrl: ${sourceUrl}\n---\n\nModule article.\n`}]};
}
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'ttp-receiver-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  return root;
}
const receive = (root, value = bundle()) => importTtpBundle({siteRoot: root, bundle: value, expectedRevision: revision, runId: 123});

test('trusts only successful full main validation, including manual recovery; rejects PR/fork/workflow substitutions', () => {
  const run = {repository: {full_name: ttpRepository}, head_repository: {full_name: ttpRepository}, path: '.github/workflows/validate-ttps.yml', head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success', head_sha: revision};
  assert.equal(verifyTtpRun(run), revision);
  assert.equal(verifyTtpRun({...run, event: 'workflow_dispatch'}), revision);
  for (const patch of [{event: 'pull_request'}, {head_branch: 'feature'}, {head_repository: {full_name: 'someone/fork'}}, {path: '.github/workflows/other.yml'}, {conclusion: 'failure'}, {status: 'in_progress'}]) assert.throws(() => verifyTtpRun({...run, ...patch}));
  assert.throws(() => verifyTtpRun(run, {repository: 'attacker/repo'}));
  assert.throws(() => verifyTtpRun(run, {revision: 'b'.repeat(40)}));
  for (const input of [0, -1, '1.1', '2;echo', undefined]) assert.throws(() => ttpRunId(input));
  const artifact = {id: 1, name: 'website-ttps', expired: false, size_in_bytes: 100};
  assert.equal(selectTtpArtifact([artifact]), artifact);
  for (const list of [[], [artifact, artifact], [{...artifact, expired: true}], [{...artifact, size_in_bytes: 21 * 1024 * 1024}]]) assert.throws(() => selectTtpArtifact(list));
});

test('imports published/draft articles and source links, migrates legacy TTPs and repeats without changes', async t => {
  const root = await fixture(t), folder = path.join(root, 'library/heuristics', id);
  await mkdir(folder, {recursive: true});
  await writeFile(path.join(folder, 'index.md'), bundle().entries[0].article);
  await writeFile(path.join(folder, 'attachment.txt'), 'Keep source asset');
  await receive(root);
  assert.equal((await readLibrary(root)).heuristics[0].sourceUrl, bundle().entries[0].sourceUrl);
  const before = await readFile(path.join(folder, 'index.md'), 'utf8');
  await receive(root);
  assert.equal(await readFile(path.join(folder, 'index.md'), 'utf8'), before);
  assert.equal(await readFile(path.join(folder, 'attachment.txt'), 'utf8'), 'Keep source asset');
  await receive(root, bundle(true));
  assert.deepEqual((await readLibrary(root)).heuristics, []);
});

test('removals retire managed entries; manual CVE/TTP articles and supporting assets remain; entries can return', async t => {
  const root = await fixture(t);
  await receive(root);
  for (const [folder, fields] of [['cve-cve-2025-99999', 'framework: cve\nidentifier: CVE-2025-99999'], ['ttp-t9999', 'framework: ttp\nidentifier: T9999']]) {
    await mkdir(path.join(root, 'library/heuristics', folder));
    await writeFile(path.join(root, 'library/heuristics', folder, 'index.md'), `---\ntitle: Manual\ndescription: Manual article\n${fields}\n---\n\nManual content\n`);
  }
  const result = await receive(root, {...bundle(), entries: []});
  assert.deepEqual(result.retired, [id]);
  assert.deepEqual((await readLibrary(root)).heuristics.map(x => x.id).sort(), ['cve-cve-2025-99999', 'ttp-t9999']);
  assert.match(await readFile(path.join(root, 'library/heuristics', id, 'index.md'), 'utf8'), /draft: true/);
  await receive(root);
  assert.equal((await readLibrary(root)).heuristics.length, 3);
});

test('rejects malformed metadata, duplicate IDs, traversal and provenance mismatches before writing', async t => {
  const mutations = [
    value => {value.sourceRevision = 'b'.repeat(40);},
    value => {value.entries[0].id = '../escape';},
    value => {value.entries[0].module = 'T9999';},
    value => {value.entries.push(value.entries[0]);},
    value => {value.entries[0].sourceUrl = 'https://attacker.example';},
    value => {value.entries[0].article = value.entries[0].article.replace('draft: false', 'draft: false\ndraft: true');},
    value => {value.entries[0].article = value.entries[0].article.replace('framework: ttp', 'framework: cve');},
    value => {value.entries[0].article = value.entries[0].article.replace('draft: false', 'draft: false\nslug: /unrelated');},
  ];
  for (const mutate of mutations) {
    const root = await fixture(t), value = bundle(); mutate(value);
    await assert.rejects(receive(root, value)); assert.deepEqual(await readdir(root), []);
  }
});

test('rejects destination junctions/symlinks and conflicting MDX before modifying content', async t => {
  const root = await fixture(t), outside = await fixture(t);
  await mkdir(path.join(root, 'library/heuristics'), {recursive: true});
  await symlink(outside, path.join(root, 'library/heuristics', id), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(receive(root), /Unsafe/); assert.deepEqual(await readdir(outside), []);
  const other = await fixture(t);
  await mkdir(path.join(other, 'library/heuristics', id), {recursive: true});
  await writeFile(path.join(other, 'library/heuristics', id, 'index.mdx'), 'Existing MDX');
  await assert.rejects(receive(other), /index.mdx/);
});

test('workflow verifies exact artifacts and freshness, scopes writes, and builds before opening the PR', async () => {
  const workflow = load(await readFile(new URL('../.github/workflows/sync-ttp-library.yml', import.meta.url), 'utf8'));
  const steps = workflow.jobs.sync.steps;
  assert.ok(steps.find(step => step.id === 'source').with.script.includes('verifyTtpRun'));
  assert.match(steps.find(step => step.id === 'source').with.script, /repo: 'cradle-lib'/);
  assert.match(steps.find(step => step.id === 'freshness').with.script, /repo: 'cradle-lib'/);
  assert.equal(steps.find(step => step.uses?.startsWith('actions/download-artifact')).with.repository, 'cradle-lang/cradle-lib');
  assert.deepEqual(workflow.on.repository_dispatch.types, ['ttp-library-updated']);
  assert.ok(steps.find(step => step.uses?.startsWith('actions/download-artifact')).with['artifact-ids']);
  const build = steps.findIndex(step => step.run?.includes('npm run build'));
  const review = steps.findIndex(step => step.uses?.startsWith('peter-evans/create-pull-request'));
  assert.ok(build > 0 && review > build);
  assert.equal(steps[review].if, "steps.freshness.outputs.current == 'true'");
  assert.equal(steps[review].with.branch, 'ttp-library-sync');
  assert.match(steps[review].with['add-paths'], /library\/heuristics\/ttp-t\*\/index.md/);
  assert.doesNotMatch(steps[review].with['add-paths'], /cve|configurations|scenarios/);
});

test('sub-technique import preserves the identifier and migrates the existing hyphenated article route', async t => {
  const root = await fixture(t), value = bundle(), technique = 'T1053.003';
  value.entries[0] = {...value.entries[0], id: 'ttp-t1053-003', module: technique,
    sourceUrl: value.entries[0].sourceUrl.replaceAll('T1105', technique),
    article: value.entries[0].article.replaceAll('T1105', technique)};
  await receive(root, value);
  const entries = (await readLibrary(root)).heuristics;
  assert.equal(entries[0].id, 'ttp-t1053-003');
  assert.equal(entries[0].value, technique);
  const bad = structuredClone(value); bad.entries[0].id = 'ttp-t1053.003';
  await assert.rejects(receive(root, bad), /identity/);
});
