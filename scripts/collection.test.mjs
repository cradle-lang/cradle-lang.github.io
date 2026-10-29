import assert from 'node:assert/strict';
import {readFile, mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import {readLibrary} from './generate-library.mjs';

const root = new URL('../', import.meta.url);
const {scenarios: catalog} = await readLibrary(fileURLToPath(root));
const parserTs = await readFile(new URL('src/components/workbench/utils/cradleParser.ts', root), 'utf8');
const {outputText} = ts.transpileModule(parserTs, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
const {parseCradleForWorkbench} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('collection links resolve to unique, parseable specifications', async () => {
  assert.ok(catalog.length > 0);
  assert.equal(new Set(catalog.map(({id}) => id)).size, catalog.length);
  for (const scenario of catalog) {
    assert.match(scenario.id, /^[a-z0-9-]+$/);
    assert.match(scenario.file, /^[^/\\]+\.cradle$/);
    for (const field of ['name', 'source', 'category', 'description', 'requirements']) {
      assert.ok(scenario[field]?.trim(), `${scenario.id} needs ${field}`);
    }
    assert.ok(scenario.tags.length > 0);
    const source = await readFile(new URL(scenario.sourcePath, root), 'utf8');
    assert.equal(scenario.spec, source, 'Workbench and compilation must use the contributor source');
    const parsed = parseCradleForWorkbench(source);
    assert.ok(parsed.instances.length > 0, `${scenario.id} needs instances`);
    assert.ok(parsed.networks.length > 0, `${scenario.id} needs networks`);
    assert.ok(Array.isArray(parsed.events), `${scenario.id} needs an event collection; provisioning-only scenarios may have none`);

  }
});

test('built-in Workbench examples remain available independently of collection entries', async () => {
  for (const [id, instances, networks, events] of [['hello-world', 2, 1, 1], ['sme', 14, 5, 4]]) {
    const parsed = parseCradleForWorkbench(await readFile(new URL(`src/components/workbench/data/${id}.cradle`, root), 'utf8'));
    assert.equal(parsed.instances.length, instances);
    assert.equal(parsed.networks.length, networks);
    assert.equal(parsed.events.length, events);
  }
});

test('the compilation workflow validates and compiles without invoking runtime tooling', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'cradle-compilation-'));
  try {
    const bin = path.join(temporary, 'bin');
    const log = path.join(temporary, 'calls.jsonl');
    const output = path.join(temporary, 'output');
    await mkdir(bin);
    const mock = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.CALL_LOG, JSON.stringify(args)+'\\n');
if (args[0] === 'validate' && process.env.FAIL_VALIDATE) process.exit(1);
if (args[0] === 'compile') {
  fs.writeFileSync(args[args.indexOf('-o')+1], 'scenario: compiled\\n');
}
if (args[0] === '--version') console.log('cxc test-version');
`;
    await writeFile(path.join(bin, 'cxc'), mock, {mode: 0o755});
    const env = {...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, CALL_LOG: log};
    const script = fileURLToPath(new URL('scripts/compile-collection-scenario.sh', root));
    const run = (id, extra = {}) => spawnSync('bash', [script, id, fileURLToPath(root), output], {env: {...env, ...extra}, encoding: 'utf8'});
    const success = run('hello-world');
    assert.equal(success.status, 0, success.stderr);
    const calls = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
    assert.deepEqual(calls.map(([action]) => action), ['validate', 'compile', '--version']);
    assert.ok(calls[0].includes(fileURLToPath(new URL(catalog.find(({id}) => id === 'hello-world').sourcePath, root))), 'relative includes need the original source directory');
    assert.equal(await readFile(path.join(output, 'scenario.yml'), 'utf8'), 'scenario: compiled\n');
    assert.match(await readFile(path.join(output, 'revision.txt'), 'utf8'), /^[a-f0-9]{40}\n$/);
    const report = await readFile(path.join(output, 'report.md'), 'utf8');
    assert.match(report, /CradleXC validation: \*\*Passed\*\*\. Compilation: \*\*Passed\*\*/);
    assert.match(report, /1 instances · 1 networks · 1 events/);
    assert.match(report, /cxc test-version/);
    assert.match(report, /### Instances[\s\S]*### Networks[\s\S]*### Events[\s\S]*### Objects/);
    assert.ok(report.includes((await readFile(path.join(output, 'revision.txt'), 'utf8')).trim()));
    await assert.rejects(readFile(path.join(output, 'source/scenario.cradle')), {code: 'ENOENT'});
    await writeFile(log, '');
    assert.notEqual(run('hello-world', {FAIL_VALIDATE: '1'}).status, 0);
    assert.deepEqual((await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line)[0]), ['validate']);
    await writeFile(log, '');
    assert.notEqual(run('../other').status, 0);
    assert.equal(await readFile(log, 'utf8'), '');
    const workflow = await readFile(new URL('.github/workflows/validate-scenario.yml', root), 'utf8');
    assert.match(workflow, /runs-on: ubuntu-latest/);
    assert.doesNotMatch(workflow, /self-hosted|secrets\.|environment:/);
    assert.doesNotMatch(workflow, /upload-artifact/);
    assert.match(workflow, /report\.md.*GITHUB_STEP_SUMMARY/);
    await assert.rejects(readFile(new URL('.github/workflows/deploy-scenario.yml', root)), {code: 'ENOENT'});
  } finally {
    await rm(temporary, {recursive: true, force: true});
  }
});


test('published Hello World includes its local modules and event object', () => {
  const scenario = catalog.find(({id}) => id === 'hello-world');
  assert.ok(scenario);
  assert.equal(scenario.file, 'HelloWorld.cradle');
  const parsed = parseCradleForWorkbench(scenario.spec);
  assert.equal(parsed.instances.length, 1);
  assert.equal(parsed.networks.length, 1);
  assert.equal(parsed.events.length, 1);
  const host = parsed.instances[0];
  assert.equal(host.id, 'hello');
  assert.ok(host.configs.includes('hello-world'));
  assert.ok(host.configs.includes('linux-unzip'));
  assert.ok(host.heuristics.some(({type, value}) => type === 'cve' && value === 'CVE-2021-44228'));
  assert.ok(parsed.objects.some(({id}) => id === 'hello'));
});
