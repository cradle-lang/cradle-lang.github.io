import {lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRepository = 'mashmllo/scenario_library';
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const expectedFiles = ['index.md', 'scenario.cradle'];

export async function validateBundle(bundle, expectedRevision) {
  if (!/^[a-f0-9]{40}$/i.test(expectedRevision || '')) throw new Error('Expected source revision must be a full commit SHA');
  if (bundle?.schemaVersion !== 1 || bundle.sourceRepository !== sourceRepository || bundle.sourceRevision !== expectedRevision) throw new Error('Bundle source repository/revision does not match the verified dispatch');
  if (!Array.isArray(bundle.scenarios) || bundle.scenarios.length > 1000) throw new Error('Invalid scenario snapshot');
  const ids = new Set();
  for (const scenario of bundle.scenarios) {
    if (!slug.test(scenario.id || '') || ids.has(scenario.id)) throw new Error('Invalid or duplicate scenario folder ID');
    ids.add(scenario.id);
    for (const key of ['spec', 'article']) {
      if (typeof scenario[key] !== 'string' || !scenario[key].trim() || Buffer.byteLength(scenario[key]) > 2 * 1024 * 1024) throw new Error(`${scenario.id}: invalid ${key} content`);
    }
    if (!/^---\r?\n/.test(scenario.article)) throw new Error(`${scenario.id}: article requires YAML front matter`);
    const {frontMatter} = await DEFAULT_PARSE_FRONT_MATTER({filePath: `${scenario.id}/index.md`, fileContent: scenario.article});
    for (const key of ['title', 'description']) if (typeof frontMatter[key] !== 'string' || !frontMatter[key].trim()) throw new Error(`${scenario.id}: missing article ${key}`);
    if (frontMatter.draft !== undefined && typeof frontMatter.draft !== 'boolean') throw new Error(`${scenario.id}: invalid draft flag`);
    if (frontMatter.thumbnail !== undefined || frontMatter.thumbnailAlt !== undefined) throw new Error(`${scenario.id}: two-file website copies cannot include custom thumbnails`);
  }
  return bundle.scenarios;
}

export async function syncScenarioLibrary(bundle, {websiteRoot = root, expectedRevision} = {}) {
  const scenarios = await validateBundle(bundle, expectedRevision);
  const scenarioRoot = path.resolve(websiteRoot, 'library/scenarios');
  for (const directory of [path.resolve(websiteRoot), path.resolve(websiteRoot, 'library'), scenarioRoot]) {
    if (!(await lstat(directory)).isDirectory()) throw new Error('Website scenario parent must be a regular directory');
  }
  // Validate every destination before replacing any files. Only IDs in this
  // snapshot are updated; other website entries are never removed.
  for (const {id} of scenarios) {
    const target = path.join(scenarioRoot, id);
    if (path.dirname(target) !== scenarioRoot) throw new Error('Destination escapes website scenario root');
    const info = await lstat(target).catch((error) => {if (error.code === 'ENOENT') return null; throw error;});
    if (info && !info.isDirectory()) throw new Error(`${id}: destination must be a regular directory`);
  }
  const updated = [];
  for (const {id, spec, article} of scenarios) {
    const target = path.join(scenarioRoot, id);
    const current = await readdir(target).catch((error) => {if (error.code === 'ENOENT') return []; throw error;});
    if (current.sort().join('\0') === expectedFiles.join('\0')) {
      const info = await Promise.all(expectedFiles.map((name) => lstat(path.join(target, name))));
      if (info.every((file) => file.isFile()) && await readFile(path.join(target, 'scenario.cradle'), 'utf8') === spec && await readFile(path.join(target, 'index.md'), 'utf8') === article) continue;
    }
    const staging = await mkdtemp(path.join(scenarioRoot, '.scenario-sync-'));
    const backup = path.join(scenarioRoot, `.scenario-backup-${randomUUID()}`);
    let backedUp = false;
    try {
      await writeFile(path.join(staging, 'scenario.cradle'), spec);
      await writeFile(path.join(staging, 'index.md'), article);
      try {await rename(target, backup); backedUp = true;} catch (error) {if (error.code !== 'ENOENT') throw error;}
      try {await rename(staging, target);} catch (error) {if (backedUp) {await rename(backup, target); backedUp = false;} throw error;}
      if (backedUp) {await rm(backup, {recursive: true, force: true}); backedUp = false;}
      updated.push(id);
    } finally {
      await rm(staging, {recursive: true, force: true});
    }
  }
  const githubRoot = path.join(websiteRoot, '.github');
  await mkdir(githubRoot, {recursive: true});
  if (!(await lstat(githubRoot)).isDirectory()) throw new Error('Website .github must be a regular directory');
  await writeFile(path.join(githubRoot, 'scenario-library-source.json'), `${JSON.stringify({sourceRepository, sourceRevision: expectedRevision, scenarios: scenarios.map(({id}) => id)}, null, 2)}\n`);
  return updated;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [bundlePath, expectedRevision] = process.argv.slice(2);
    if (!bundlePath) throw new Error('Usage: node scripts/sync-scenario-library.mjs <bundle.json> <verified-source-sha>');
    const info = await lstat(bundlePath);
    if (!info.isFile() || info.size > 32 * 1024 * 1024) throw new Error('Invalid/oversized bundle file');
    const bundle = JSON.parse(await readFile(bundlePath, 'utf8'));
    const updated = await syncScenarioLibrary(bundle, {expectedRevision});
    console.log(`Updated ${updated.length} scenario folder(s): ${updated.join(', ') || 'none'}. Each contains only scenario.cradle and index.md.`);
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
