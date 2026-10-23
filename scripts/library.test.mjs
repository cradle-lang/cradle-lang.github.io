import assert from 'node:assert/strict';
import {cp, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import {generateLibrary, readLibrary} from './generate-library.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
async function loadTS(relative) {
  const source = await readFile(path.join(root, relative), 'utf8');
  const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const {mergeResources} = await loadTS('src/components/collection/resources.ts');
const {parseCradleForWorkbench} = await loadTS('src/components/workbench/utils/cradleParser.ts');
async function article(rootPath, kind, id, data, extension = 'md') {
  const folder = path.join(rootPath, 'library', kind, id);
  await mkdir(folder, {recursive: true});
  await writeFile(path.join(folder, `index.${extension}`), `---\n${JSON.stringify(data)}\n---\n\nA contributor-written article.\n`);
  return folder;
}

test('a new Markdown/MDX folder is discovered without a code or workflow registry', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-library-'));
  try {
    await cp(path.join(root, 'library/scenarios/hello-world'), path.join(temporary, 'library/scenarios/new-range'), {recursive: true});
    const config = await article(temporary, 'configurations', 'documented-router', {title: 'Custom router guide', description: 'An authored description', config: 'linux-router', os: 'Linux', category: 'Networking'}, 'mdx');
    await writeFile(path.join(config, 'setup.yml'), 'tasks: []\n');
    await article(temporary, 'configurations', 'standalone', {title: 'Standalone', description: 'Reusable before any scenario needs it', config: 'standalone-config', os: 'Windows'});
    await article(temporary, 'heuristics', 'sql-injection', {title: 'SQL injection', description: 'An authored mapping', framework: 'CWE', identifier: 'CWE-89'});
    const draft = await article(temporary, 'scenarios', 'draft-range', {draft: true});
    await mkdir(path.join(draft, 'assets'));
    await cp(path.join(root, 'library/_templates'), path.join(temporary, 'library/_templates'), {recursive: true});
    const result = await generateLibrary(temporary);
    assert.deepEqual(result.scenarios.map(({id}) => id), ['new-range']);
    assert.equal(result.configurations.length, 2);
    assert.equal(result.heuristics.length, 1);
    assert.equal(result.configurations.find(({key}) => key === 'linux-router').docUrl, '/library/configurations/documented-router');
    assert.ok(result.scenarios[0].spec.includes('HelloWorld'));
    const generated = JSON.parse(await readFile(path.join(temporary, 'src/data/library.generated.json'), 'utf8'));
    assert.deepEqual(generated, result);
    const assetModule = await readFile(path.join(temporary, 'src/data/library-assets.generated.ts'), 'utf8');
    assert.ok(assetModule.includes('../../library/scenarios/new-range/scenario.cradle'));
    assert.doesNotMatch(assetModule, /localhost|127\.0\.0\.1/);
    const resolved = spawnSync(process.execPath, [path.join(root, 'scripts/resolve-library-scenario.mjs'), 'new-range', temporary], {encoding: 'utf8'});
    assert.equal(resolved.status, 0, resolved.stderr);
    assert.equal(resolved.stdout.trim(), path.join(temporary, 'library/scenarios/new-range/scenario.cradle'));
    const unpublished = spawnSync(process.execPath, [path.join(root, 'scripts/resolve-library-scenario.mjs'), 'draft-range', temporary], {encoding: 'utf8'});
    assert.notEqual(unpublished.status, 0, 'draft scenarios cannot be compiled as published entries');
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('automatic references merge with authored entries and standalone resources retain zero usages', async () => {
  const {scenarios} = await readLibrary(root);
  const source = scenarios.find(({id}) => id === 'hello-world');
  const parsed = parseCradleForWorkbench(source.spec);
  parsed.instances[0].heuristics.push({type: 'CWE', value: 'CWE-89'});
  parsed.instances[1].heuristics.push({type: 'cwe', value: 'CWE-89'});
  const entry = {...source, parsed};
  const documents = {
    configurations: [{key: 'linux-router', name: 'Routing', description: 'Authored content', os: 'Linux', category: 'Networking', docUrl: '/library/configurations/routing'}, {key: 'new-config', name: 'Standalone', description: 'No usages yet', os: 'Linux', category: 'Services', docUrl: '/library/configurations/new-config'}],
    heuristics: [{type: 'cwe', value: 'CWE-89', name: 'SQL injection', description: 'Authored heuristic', docUrl: '/library/heuristics/sql'}, {type: 'ttp', value: 'T1059', name: 'Command interpreter', description: 'Standalone mapping', docUrl: '/library/heuristics/command'}],
  };
  const result = mergeResources([entry], documents);
  assert.equal(result.configurations.filter(({name}) => name === 'linux-router').length, 1);
  assert.equal(result.configurations.find(({name}) => name === 'linux-router').description, 'Authored content');
  assert.equal(result.configurations.find(({name}) => name === 'linux-router').scenarios.length, 1);
  assert.equal(result.configurations.find(({name}) => name === 'new-config').scenarios.length, 0);
  assert.equal(result.heuristics.length, 2, 'framework matching must ignore case and deduplicate multiple component usages');
  assert.equal(result.heuristics.find(({type}) => type === 'cwe').usages.length, 2);
  assert.equal(result.heuristics.find(({type}) => type === 'cwe').scenarios.length, 1);
  assert.equal(result.heuristics.find(({type}) => type === 'ttp').scenarios.length, 0);
  assert.deepEqual(result.frameworks, ['cwe', 'ttp']);
  const automaticOnly = mergeResources([entry], {configurations: [], heuristics: []});
  assert.ok(automaticOnly.configurations.some(({name}) => name === 'linux-router'));
  assert.equal(automaticOnly.heuristics.length, 1);
  assert.equal(mergeResources([], {configurations: [], heuristics: []}).configurations.length, 0);
});

test('invalid or ambiguous contributor entries fail with actionable paths', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-library-invalid-'));
  try {
    const data = {title: 'Config', description: 'Valid description', config: 'same-key', os: 'Linux'};
    const folder = await article(temporary, 'configurations', 'one', {...data, description: ''});
    await assert.rejects(readLibrary(temporary), /library\/configurations\/one\/index.md: description/);
    await article(temporary, 'configurations', 'one', data);
    await article(temporary, 'configurations', 'two', data);
    await assert.rejects(readLibrary(temporary), /duplicate configuration/);
    await rm(path.join(temporary, 'library/configurations/two'), {recursive: true});
    await writeFile(path.join(folder, 'index.mdx'), '---\ntitle: Duplicate\n---\n');
    await assert.rejects(readLibrary(temporary), /exactly one index.md or index.mdx/);
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('the contributor command creates Markdown/MDX drafts and never overwrites an entry', async () => {
  const {createLibraryEntry} = await import('./new-library-entry.mjs');
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-library-template-'));
  try {
    await createLibraryEntry('scenario', 'my-range', {root: temporary, mdx: true});
    const destination = path.join(temporary, 'library/scenarios/my-range/index.mdx');
    const original = await readFile(destination, 'utf8');
    assert.match(original, /draft: true/);
    assert.ok((await readFile(path.join(temporary, 'library/scenarios/my-range/scenario.cradle'), 'utf8')).length > 0);
    assert.equal((await readLibrary(temporary)).scenarios.length, 0, 'a new template must never appear as a runnable scenario');
    await assert.rejects(createLibraryEntry('scenario', 'my-range', {root: temporary}), /EEXIST/);
    assert.equal(await readFile(destination, 'utf8'), original);
    await assert.rejects(createLibraryEntry('configuration', '../escape', {root: temporary}), /lowercase folder name/);
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('automatic heuristic discovery includes repeated metadata annotations', async () => {
  const {scenarios} = await readLibrary(root);
  const source = scenarios.find(({id}) => id === 'hello-world');
  assert.ok(source);
  const spec = source.spec.replace('metadata() >', 'metadata() >\n    heuristic("cwe", "CWE-89"),\n    heuristic("ttp", "T1059"),');
  const parsed = parseCradleForWorkbench(spec);
  const result = mergeResources([{...source, parsed}], {configurations: [], heuristics: []});
  assert.deepEqual(result.frameworks, ['cwe', 'ttp']);
  assert.equal(result.heuristics.length, 2);
  assert.ok(result.heuristicUsages.every(({component}) => component === 'metadata'));
});

test('scenario artwork supports presets and colocated thumbnails with required alternative text', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-thumbnails-'));
  try {
    const folder = path.join(temporary, 'library/scenarios/custom-art');
    await cp(path.join(root, 'library/scenarios/hello-world'), folder, {recursive: true});
    const articlePath = path.join(folder, 'index.md');
    const original = (await readFile(articlePath, 'utf8')).replace(/^artwork:.*\n/m, '');
    await mkdir(path.join(folder, 'images'));
    await writeFile(path.join(folder, 'images/thumbnail.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'));
    const setFields = (fields) => writeFile(articlePath, original.replace('source: CRADLE', `source: CRADLE\n${fields}`));
    for (const artwork of ['auto', 'network', 'enterprise', 'monitoring']) {
      await setFields(`artwork: ${artwork}`);
      assert.equal((await readLibrary(temporary)).scenarios[0].artwork, artwork);
    }
    await setFields('artwork: monitoring\nthumbnail: ./images/thumbnail.png\nthumbnailAlt: Training network diagram');
    const generated = await generateLibrary(temporary);
    assert.equal(generated.scenarios[0].thumbnailPath, 'library/scenarios/custom-art/images/thumbnail.png');
    assert.equal(generated.scenarios[0].thumbnailAlt, 'Training network diagram');
    const assets = await readFile(path.join(temporary, 'src/data/library-assets.generated.ts'), 'utf8');
    assert.match(assets, /import thumbnail0 from "\.\.\/\.\.\/library\/scenarios\/custom-art\/images\/thumbnail\.png"/);
    assert.match(assets, /scenarioThumbnails[\s\S]*"custom-art": thumbnail0/);
    await setFields('thumbnail: ./images/thumbnail.png');
    await assert.rejects(readLibrary(temporary), /custom-art\/index.md: thumbnailAlt/);
    await setFields('artwork: unknown');
    await assert.rejects(readLibrary(temporary), /artwork must be/);
    await setFields('thumbnail: ../outside.png\nthumbnailAlt: Outside');
    await assert.rejects(readLibrary(temporary), /inside this scenario folder/);
    await setFields('thumbnail: ./missing.png\nthumbnailAlt: Missing');
    await assert.rejects(readLibrary(temporary), /thumbnail file does not exist/);
    await setFields('thumbnail: ./thumbnail.svg\nthumbnailAlt: Unsupported');
    await assert.rejects(readLibrary(temporary), /PNG, JPEG, WebP or GIF/);
    await setFields('');
    assert.equal((await readLibrary(temporary)).scenarios[0].artwork, 'auto');
  } finally {await rm(temporary, {recursive: true, force: true});}
});
