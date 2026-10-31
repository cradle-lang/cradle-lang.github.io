import {lstat, mkdir, readFile, realpath, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {load} from 'js-yaml';
import {configRepository, configRunId} from './config-sync-source.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const exists = file => lstat(file).catch(error => {if (error.code === 'ENOENT') return null; throw error;});
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function safePath(base, relative) {
  let current = base;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const info = await exists(current);
    if (info && (info.isSymbolicLink() || (index < parts.length - 1 ? !info.isDirectory() : !info.isFile()))) throw new Error(`Unsafe configuration destination: ${relative}`);
  }
  return current;
}
function metadata(article) {
  const match = article.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('configuration article needs YAML front matter');
  const data = load(match[1]);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('configuration front matter must be a mapping');
  return data;
}
async function changed(file, text) {
  if (await readFile(file, 'utf8').catch(error => {if (error.code === 'ENOENT') return null; throw error;}) === text) return;
  await mkdir(path.dirname(file), {recursive: true});
  const temporary = path.join(path.dirname(file), `.config-sync-${randomUUID()}.tmp`);
  try {await writeFile(temporary, text, {flag: 'wx'}); await rename(temporary, file);} finally {await rm(temporary, {force: true});}
}
export async function importConfigBundle({siteRoot = root, bundle, expectedRevision, runId} = {}) {
  siteRoot = await realpath(siteRoot);
  const sourceRunId = configRunId(runId);
  if (!/^[a-f0-9]{40}$/.test(expectedRevision || '') || bundle?.schemaVersion !== 1 || bundle.sourceRepository !== configRepository || bundle.sourceRevision !== expectedRevision || !Array.isArray(bundle.entries) || bundle.entries.length > 2000) throw new Error('Invalid configuration bundle identity/schema');
  if (Buffer.byteLength(JSON.stringify(bundle)) > 20 * 1024 * 1024) throw new Error('configuration bundle exceeds 20 MiB');
  const manifestFile = await safePath(siteRoot, 'library/configuration-library.json');
  const previousText = await readFile(manifestFile, 'utf8').catch(error => {if (error.code === 'ENOENT') return null; throw error;});
  const previous = previousText ? JSON.parse(previousText) : null;
  if (previous && (previous.schemaVersion !== 1 || previous.sourceRepository !== configRepository || !Array.isArray(previous.entries) || previous.entries.some(entry => !idPattern.test(entry.id)))) throw new Error('Invalid previous configuration sync manifest');
  const seen = new Set(), plans = [], entries = [];
  for (const entry of bundle.entries) {
    if (!entry || !idPattern.test(entry.id) || !/^[A-Za-z0-9]+(?:[-_.][A-Za-z0-9]+)*$/.test(entry.module) || entry.id !== entry.module.toLowerCase().replace(/[_.]/g, '-') || seen.has(entry.id)) throw new Error('Invalid/duplicate configuration identity');
    seen.add(entry.id);
    const sourceUrl = `https://github.com/${configRepository}/tree/${expectedRevision}/configs/${entry.module}`;
    if (entry.sourceUrl !== sourceUrl || typeof entry.article !== 'string' || Buffer.byteLength(entry.article) > 1024 * 1024) throw new Error('Invalid configuration source URL/article');
    const data = metadata(entry.article);
    if (data.sourceUrl !== sourceUrl || data.config !== entry.module || !['Linux', 'Windows', 'Cross-platform', 'Unspecified'].includes(data.os) || typeof data.category !== 'string' || !data.category.trim() || typeof data.draft !== 'boolean' || ![data.title, data.description].every(value => typeof value === 'string' && value.trim()) || ['id', 'slug', 'deployment', 'framework', 'identifier'].some(key => data[key] !== undefined)) throw new Error('configuration article metadata does not match source');
    const file = await safePath(siteRoot, `library/configurations/${entry.id}/index.md`);
    if (await exists(path.join(path.dirname(file), 'index.mdx'))) throw new Error(`${entry.id}: resolve existing index.mdx before syncing`);
    const old = await readFile(file, 'utf8').catch(error => {if (error.code === 'ENOENT') return null; throw error;});
    if (old) {
      const oldData = metadata(old);
      if (oldData.config !== entry.module) throw new Error('configuration destination collides with an unrelated article');
    }
    plans.push({file, text: entry.article});
    entries.push({id: entry.id, module: entry.module, title: data.title, description: data.description, draft: data.draft, os: data.os, category: data.category, sourceUrl});
  }
  // Retire only entries we previously managed. Keep supporting assets and manual configuration and heuristic articles.
  const retired = [];
  for (const entry of previous?.entries || []) {
    if (seen.has(entry.id)) continue;
    const file = await safePath(siteRoot, `library/configurations/${entry.id}/index.md`);
    const old = await readFile(file, 'utf8').catch(error => {if (error.code === 'ENOENT') return null; throw error;});
    if (old) {
      const data = metadata(old);
      if (data.config !== entry.module || !['Linux', 'Windows', 'Cross-platform', 'Unspecified'].includes(data.os) || typeof data.category !== 'string' || !data.category.trim() || data.sourceUrl !== entry.sourceUrl) throw new Error('Removed configuration article was manually reassigned; resolve before syncing');
      const text = old.replace(/^draft:.*$/m, 'draft: true');
      if (text === old && data.draft !== true) throw new Error('Cannot retire configuration without explicit draft flag');
      plans.push({file, text}); retired.push(entry.id);
    }
  }
  const manifest = {schemaVersion: 1, sourceRepository: configRepository, sourceRevision: expectedRevision, sourceRunId, entries: entries.sort((a,b) => a.id.localeCompare(b.id))};
  plans.push({file: manifestFile, text: JSON.stringify(manifest, null, 2) + '\n'});
  for (const plan of plans) await changed(plan.file, plan.text);
  return {manifest, retired};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const info = await lstat(process.env.CONFIG_BUNDLE || '');
    if (!info.isFile() || info.size > 20 * 1024 * 1024) throw new Error('CONFIG_BUNDLE must name a regular JSON file of at most 20 MiB');
    const result = await importConfigBundle({bundle: JSON.parse(await readFile(process.env.CONFIG_BUNDLE, 'utf8')), expectedRevision: process.env.SOURCE_SHA, runId: process.env.SOURCE_RUN_ID});
    console.log(`Imported ${result.manifest.entries.length} configurations; retired ${result.retired.length} removed entries.`);
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
