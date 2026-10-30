import assert from 'node:assert/strict';
import {cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
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
async function publishFixture(folder) {
  const filename = path.join(folder, 'index.md');
  await writeFile(filename, (await readFile(filename, 'utf8')).replace(/^draft:.*$/m, 'draft: false'));
}

test('a new Markdown/MDX folder is discovered without a code or workflow registry', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-library-'));
  try {
    await cp(path.join(root, 'library/scenarios/hello-world'), path.join(temporary, 'library/scenarios/new-range'), {recursive: true});
    await publishFixture(path.join(temporary, 'library/scenarios/new-range'));
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
    assert.ok(assetModule.includes(`../../${result.scenarios[0].sourcePath}`));
    assert.doesNotMatch(assetModule, /localhost|127\.0\.0\.1/);
    const resolved = spawnSync(process.execPath, [path.join(root, 'scripts/resolve-library-scenario.mjs'), 'new-range', temporary], {encoding: 'utf8'});
    assert.equal(resolved.status, 0, resolved.stderr);
    assert.equal(resolved.stdout.trim(), path.join(temporary, result.scenarios[0].sourcePath));
    const unpublished = spawnSync(process.execPath, [path.join(root, 'scripts/resolve-library-scenario.mjs'), 'draft-range', temporary], {encoding: 'utf8'});
    assert.notEqual(unpublished.status, 0, 'draft scenarios cannot be compiled as published entries');
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('only published articles populate resources while scenario usages remain linked', async () => {
  const source = {id: 'example', name: 'Example', description: 'Fixture scenario'};
  const parsed = parseCradleForWorkbench(await readFile(path.join(root, 'src/components/workbench/data/hello-world.cradle'), 'utf8'));
  parsed.instances[0].heuristics.push({type: 'CWE', value: 'CWE-89'});
  parsed.instances[1].heuristics.push({type: 'cwe', value: 'CWE-89'});
  const entry = {...source, parsed};
  const documents = {
    configurations: [{key: 'linux-router', name: 'Routing', description: 'Authored content', sourceUrl: 'https://github.com/cradle-lang/cradle-lib', os: 'Linux', category: 'Networking', docUrl: '/library/configurations/routing'}, {key: 'new-config', name: 'Standalone', description: 'No usages yet', os: 'Linux', category: 'Services', docUrl: '/library/configurations/new-config'}],
    heuristics: [{type: 'cwe', value: 'CWE-89', name: 'SQL injection', description: 'Authored heuristic', sourceUrl: 'https://github.com/cradle-lang/cradle-lib', docUrl: '/library/heuristics/sql'}, {type: 'ttp', value: 'T1059', name: 'Command interpreter', description: 'Standalone mapping', docUrl: '/library/heuristics/command'}],
  };
  const result = mergeResources([entry], documents);
  assert.equal(result.configurations.find(({name}) => name === 'linux-router').sourceUrl, 'https://github.com/cradle-lang/cradle-lib');
  assert.equal(result.heuristics.find(({type}) => type === 'cwe').sourceUrl, 'https://github.com/cradle-lang/cradle-lib');
  assert.equal(result.configurations.filter(({name}) => name === 'linux-router').length, 1);
  assert.equal(result.configurations.find(({name}) => name === 'linux-router').description, 'Authored content');
  assert.equal(result.configurations.find(({name}) => name === 'linux-router').scenarios.length, 1);
  assert.equal(result.configurations.find(({name}) => name === 'new-config').scenarios.length, 0);
  assert.equal(result.heuristics.length, 2, 'framework matching must ignore case and deduplicate multiple component usages');
  assert.equal(result.heuristics.find(({type}) => type === 'cwe').usages.length, 2);
  assert.equal(result.heuristics.find(({type}) => type === 'cwe').scenarios.length, 1);
  assert.equal(result.heuristics.find(({type}) => type === 'ttp').scenarios.length, 0);
  assert.deepEqual(result.frameworks, ['cwe', 'ttp']);
  assert.equal(result.configurations.length, 2, 'unpublished configuration references must not become entries');
  const automaticOnly = mergeResources([entry], {configurations: [], heuristics: []});
  assert.equal(automaticOnly.configurations.length, 0);
  assert.equal(automaticOnly.heuristics.length, 0);
  assert.deepEqual(automaticOnly.frameworks, []);
  assert.equal(automaticOnly.heuristicUsages.length, 2, 'scenario details still show their own annotations');
  parsed.instances[0].heuristics.push({type: 'cve', value: 'CVE-2024-1086'});
  const withUnpublished = mergeResources([entry], documents);
  assert.equal(withUnpublished.heuristics.length, 2, 'unpublished heuristic references must not become entries');
  assert.deepEqual(withUnpublished.frameworks, ['cwe', 'ttp']);
  assert.equal(mergeResources([], {configurations: [], heuristics: []}).configurations.length, 0);
});

test('module links survive a catalog generated without optional source URLs', () => {
  const documents = {
    configurations: [{key: 'win-tellerApp', name: 'Teller app', description: 'Windows app', os: 'Windows', category: 'Other', docUrl: '/library/configurations/win-tellerapp'}],
    heuristics: [
      {type: 'ttp', value: 'T1053.003', name: 'Cron', description: 'Scheduled tasks', docUrl: '/library/heuristics/cron'},
      {type: 'cve', value: 'CVE-2024-1086', name: 'Netfilter', description: 'Kernel module', docUrl: '/library/heuristics/netfilter'},
    ],
  };
  const result = mergeResources([], documents);
  assert.equal(result.configurations[0].sourceUrl, 'https://github.com/cradle-lang/cradle-lib/tree/main/configs/win-tellerApp');
  assert.equal(result.heuristics[0].sourceUrl, 'https://github.com/cradle-lang/cradle-lib/tree/main/heuristics/ttp/T1053.003');
  assert.equal(result.heuristics[1].sourceUrl, 'https://github.com/cradle-lang/cradle-lib-cve/tree/main/CVE-2024-1086');
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
    await assert.rejects(createLibraryEntry('configuration', 'Invalid slug', {root: temporary}), /lowercase folder name/);
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('scenario file imports preserve source, create drafts, and reject unsafe or missing inputs', async () => {
  const {createLibraryEntry} = await import('./new-library-entry.mjs');
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-library-import-'));
  try {
    const source = path.join(temporary, 'Railway.cradle');
    const spec = await readFile(path.join(root, 'src/components/workbench/data/hello-world.cradle'), 'utf8');
    await writeFile(source, spec);
    assert.equal(await createLibraryEntry('scenario', source, {root: temporary, mdx: true}), 'library/scenarios/railway');
    const folder = path.join(temporary, 'library/scenarios/railway');
    assert.equal(await readFile(path.join(folder, 'scenario.cradle'), 'utf8'), spec);
    const markdown = await readFile(path.join(folder, 'index.mdx'), 'utf8');
    assert.match(markdown, /title: "Railway"/);
    assert.match(markdown, /draft: true/);
    assert.equal((await readLibrary(temporary)).scenarios.length, 0);
    await writeFile(source, 'changed source');
    await assert.rejects(createLibraryEntry('scenario', source, {root: temporary}), /EEXIST/);
    assert.equal(await readFile(path.join(folder, 'scenario.cradle'), 'utf8'), spec);
    await assert.rejects(createLibraryEntry('scenario', path.join(temporary, 'Missing.cradle'), {root: temporary}), /ENOENT/);
    const empty = path.join(temporary, 'Empty.cradle');
    await writeFile(empty, '  \n');
    await assert.rejects(createLibraryEntry('scenario', empty, {root: temporary}), /Source is empty/);
    const invalid = path.join(temporary, '---.cradle');
    await writeFile(invalid, spec);
    await assert.rejects(createLibraryEntry('scenario', invalid, {root: temporary}), /lowercase folder name/);
    await assert.rejects(createLibraryEntry('scenario', path.join(temporary, 'source.yml'), {root: temporary}), /require a .cradle file/);
    assert.deepEqual(await readdir(path.join(temporary, 'library/scenarios')), ['railway']);
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('configuration and heuristic imports preserve files and link them from draft articles', async () => {
  const {createLibraryEntry} = await import('./new-library-entry.mjs');
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-library-resource-import-'));
  try {
    for (const [kind, filename, slug, mdx] of [
      ['configuration', 'Linux Router.yml', 'linux-router', false],
      ['heuristic', 'CWE-89.json', 'cwe-89', true],
      ['configuration', 'index.md', 'index', true],
      ['heuristic', 'Mapping.bin', 'mapping', false],
    ]) {
      const source = path.join(temporary, filename);
      const content = Buffer.from([0, 127, 128, 255, 10]);
      await writeFile(source, content);
      const relative = await createLibraryEntry(kind, source, {root: temporary, mdx});
      assert.equal(relative, `library/${kind === 'configuration' ? 'configurations' : 'heuristics'}/${slug}`);
      const folder = path.join(temporary, relative);
      assert.deepEqual(await readFile(path.join(folder, 'assets', filename)), content);
      const markdown = await readFile(path.join(folder, `index.${mdx ? 'mdx' : 'md'}`), 'utf8');
      assert.match(markdown, /draft: true/);
      assert.ok(markdown.includes(`](./assets/${encodeURIComponent(filename)})`));
      if (kind === 'configuration') assert.ok(markdown.includes(`config: ${slug}`));
      else assert.match(markdown, /framework: cwe\nidentifier: CWE-89/);
      await writeFile(source, 'changed');
      await assert.rejects(createLibraryEntry(kind, source, {root: temporary}), /EEXIST/);
      assert.deepEqual(await readFile(path.join(folder, 'assets', filename)), content);
      assert.equal(await readFile(path.join(folder, `index.${mdx ? 'mdx' : 'md'}`), 'utf8'), markdown);
      await assert.rejects(createLibraryEntry(kind, path.join(temporary, 'missing.yml'), {root: temporary}), /ENOENT/);
      const empty = path.join(temporary, 'empty.json');
      await writeFile(empty, '');
      await assert.rejects(createLibraryEntry(kind, empty, {root: temporary}), /Source is empty/);
    }
    const catalog = await readLibrary(temporary);
    assert.equal(catalog.configurations.length, 0);
    assert.equal(catalog.heuristics.length, 0);
  } finally {await rm(temporary, {recursive: true, force: true});}
});

test('metadata annotations retain usages without creating unpublished library entries', async () => {
  const source = {id: 'example', name: 'Example', description: 'Fixture scenario'};
  const spec = (await readFile(path.join(root, 'src/components/workbench/data/hello-world.cradle'), 'utf8')).replace('metadata() >', 'metadata() >\n    heuristic("cwe", "CWE-89"),\n    heuristic("ttp", "T1059"),');
  const parsed = parseCradleForWorkbench(spec);
  const result = mergeResources([{...source, parsed}], {configurations: [], heuristics: []});
  assert.deepEqual(result.frameworks, []);
  assert.equal(result.heuristics.length, 0);
  assert.equal(result.heuristicUsages.length, 2);
  assert.ok(result.heuristicUsages.every(({component}) => component === 'metadata'));
});

test('scenario artwork supports presets and colocated thumbnails with required alternative text', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-thumbnails-'));
  try {
    const folder = path.join(temporary, 'library/scenarios/custom-art');
    await cp(path.join(root, 'library/scenarios/hello-world'), folder, {recursive: true});
    await publishFixture(folder);
    const articlePath = path.join(folder, 'index.md');
    const original = (await readFile(articlePath, 'utf8')).replace(/^(artwork|thumbnail|thumbnailAlt):[^\n]*\n/gm, '');
    await mkdir(path.join(folder, 'images'));
    await writeFile(path.join(folder, 'images/thumbnail.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'));
    const setFields = (fields) => writeFile(articlePath, original.replace(/^source:.*$/m, `source: CRADLE\n${fields}`));
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
    await setFields('thumbnail: ./thumbnail.bmp\nthumbnailAlt: Unsupported');
    await assert.rejects(readLibrary(temporary), /PNG, JPEG, WebP, GIF or SVG/);
    await setFields('');
    assert.equal((await readLibrary(temporary)).scenarios[0].artwork, 'auto');
  } finally {await rm(temporary, {recursive: true, force: true});}
});
