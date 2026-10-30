import {lstat, mkdir, readFile, realpath, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils';
import {sourceRepository, sourceRunId} from './scenario-sync-source.mjs';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const stat = filename => lstat(filename).catch(error => {if (error.code === 'ENOENT') return null; throw error;});
const sourceUrl = (revision, id) => `https://github.com/${sourceRepository}/tree/${revision}/scenarios/${id}`;

function text(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty string.`);
  return value.trim();
}

async function checkTarget(root, relative, directory = false) {
  let current = root;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const info = await stat(current);
    if (!info) continue;
    if (index < parts.length - 1 || directory) {
      if (!info.isDirectory()) throw new Error(`${relative}: expected regular directories, without symbolic links.`);
    } else if (!info.isFile()) throw new Error(`${relative}: expected a regular file, without symbolic links.`);
  }
}

async function writeChanged(filename, contents) {
  const existing = await readFile(filename).catch(error => {if (error.code === 'ENOENT') return null; throw error;});
  if (existing?.equals(Buffer.isBuffer(contents) ? contents : Buffer.from(contents))) return false;
  await mkdir(path.dirname(filename), {recursive: true});
  const temporary = path.join(path.dirname(filename), `.scenario-sync-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, contents, {flag: 'wx'});
    await rename(temporary, filename);
  } finally {await rm(temporary, {force: true});}
  return true;
}

export async function importScenarioBundle({root = siteRoot, bundle, expectedRevision, runId} = {}) {
  if (!/^[a-f0-9]{40}$/.test(expectedRevision ?? '')) throw new Error('Provide the full verified source commit SHA.');
  const verifiedRunId = sourceRunId(runId);
  if (!bundle || bundle.schemaVersion !== 1 || bundle.sourceRepository !== sourceRepository || bundle.sourceRevision !== expectedRevision) throw new Error('Bundle schema, repository or revision does not match the verified source.');
  if (!Array.isArray(bundle.scenarios) || !Array.isArray(bundle.catalog) || bundle.scenarios.length > 2000 || bundle.catalog.length !== bundle.scenarios.length) throw new Error('Bundle needs matching scenario and catalog arrays (at most 2000 entries).');
  root = await realpath(root);
  const seen = new Set();
  const catalog = new Map();
  for (const entry of bundle.catalog) {
    if (!entry || typeof entry.id !== 'string' || !slug.test(entry.id) || catalog.has(entry.id)) throw new Error('Invalid or duplicate catalog ID.');
    catalog.set(entry.id, entry);
  }
  const plans = [];
  const index = [];
  for (const entry of bundle.scenarios) {
    if (!entry || typeof entry.id !== 'string' || !slug.test(entry.id) || seen.has(entry.id) || entry.id === 'validation-smoke-test') throw new Error('Invalid, duplicate or excluded scenario ID.');
    seen.add(entry.id);
    const info = catalog.get(entry.id);
    if (!info) throw new Error(`${entry.id}: missing catalog record.`);
    if (typeof entry.spec !== 'string' || !entry.spec.trim() || typeof entry.article !== 'string' || !entry.article.startsWith('---\n')) throw new Error(`${entry.id}: missing CRADLE source or Markdown article.`);
    if (Buffer.byteLength(entry.spec) + Buffer.byteLength(entry.article) > 5 * 1024 * 1024) throw new Error(`${entry.id}: scenario exceeds 5 MiB.`);
    const {frontMatter: metadata} = await DEFAULT_PARSE_FRONT_MATTER({filePath: `${entry.id}/index.md`, fileContent: entry.article});
    const record = {id: entry.id, sourceUrl: sourceUrl(expectedRevision, entry.id)};
    if (info.sourceUrl !== record.sourceUrl || metadata.sourceUrl !== record.sourceUrl) throw new Error(`${entry.id}: GitHub source URL must point to the verified scenario folder.`);
    for (const key of ['title', 'description', 'source', 'category', 'requirements']) {
      record[key] = text(info[key], `${entry.id}: ${key}`);
      if (text(metadata[key], `${entry.id}: article ${key}`) !== record[key]) throw new Error(`${entry.id}: article and catalog ${key} differ.`);
    }
    if (!Array.isArray(info.tags) || !info.tags.every(tag => typeof tag === 'string' && tag.trim()) || (metadata.tags !== undefined && !Array.isArray(metadata.tags)) || typeof info.draft !== 'boolean' || (metadata.draft ?? false) !== info.draft || (metadata.draft !== undefined && typeof metadata.draft !== 'boolean')) throw new Error(`${entry.id}: invalid tags or draft status.`);
    record.tags = [...new Set(info.tags.map(tag => tag.trim()))];
    if (JSON.stringify(record.tags) !== JSON.stringify([...new Set((metadata.tags ?? []).map(tag => typeof tag === 'string' ? tag.trim() : tag))])) throw new Error(`${entry.id}: article and catalog tags differ.`);
    if (!info.draft && !record.tags.length) throw new Error(`${entry.id}: published scenarios require tags.`);
    record.draft = info.draft;
    record.searchText = text(info.searchText, `${entry.id}: searchText`);
    if (metadata.id !== undefined || metadata.slug !== undefined || metadata.deployment !== undefined || metadata.entrypoint !== undefined) throw new Error(`${entry.id}: bundle article has unsupported metadata.`);
    // Existing website folders may retain a README pointing to a named source.
    // Explicitly select this snapshot's scenario.cradle without deleting assets.
    const article = entry.article.replace(/^---\n/, '---\nentrypoint: scenario.cradle\n');
    const directory = `library/scenarios/${entry.id}`;
    await checkTarget(root, directory, true);
    const assets = entry.assets ?? [];
    if (!Array.isArray(assets) || assets.length > 1) throw new Error(`${entry.id}: only the declared thumbnail image may be bundled.`);
    if (metadata.thumbnail !== undefined) {
      const thumbnail = text(metadata.thumbnail, `${entry.id}: thumbnail`);
      text(metadata.thumbnailAlt, `${entry.id}: thumbnailAlt`);
      const decoded = decodeURIComponent(thumbnail);
      const image = path.posix.normalize(decoded);
      if (/[\\?#:]/.test(decoded) || path.posix.isAbsolute(image) || image.startsWith('../') || !/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(image)) throw new Error(`${entry.id}: unsafe thumbnail path.`);
      const asset = assets[0];
      if (!asset || asset.path !== image || typeof asset.base64 !== 'string' || asset.base64.length > 7 * 1024 * 1024) throw new Error(`${entry.id}: missing or invalid thumbnail image.`);
      const contents = Buffer.from(asset.base64, 'base64');
      if (!contents.length || contents.length > 5 * 1024 * 1024 || contents.toString('base64') !== asset.base64) throw new Error(`${entry.id}: invalid thumbnail encoding or size.`);
      const relative = `${directory}/${image}`;
      await checkTarget(root, relative);
      plans.push({filename: path.join(root, relative), contents});
    } else if (assets.length || metadata.thumbnailAlt !== undefined) throw new Error(`${entry.id}: thumbnail assets and alt text require thumbnail metadata.`);
    for (const [name, contents] of [['scenario.cradle', entry.spec], ['index.md', article]]) {
      const relative = `${directory}/${name}`;
      await checkTarget(root, relative);
      plans.push({filename: path.join(root, relative), contents});
    }
    // Do not leave an old index.mdx beside index.md: that requires a manual review.
    if (await stat(path.join(root, directory, 'index.mdx'))) throw new Error(`${entry.id}: existing index.mdx conflicts with the imported index.md; resolve it before syncing.`);
    index.push(record);
  }
  const manifestPath = 'library/scenario-library.json';
  await checkTarget(root, manifestPath);
  const manifest = {schemaVersion: 1, sourceRepository, sourceRevision: expectedRevision, sourceRunId: verifiedRunId, catalog: index.sort((a, b) => a.id.localeCompare(b.id))};
  plans.push({filename: path.join(root, manifestPath), contents: `${JSON.stringify(manifest, null, 2)}\n`});
  let changedFiles = 0;
  for (const plan of plans) if (await writeChanged(plan.filename, plan.contents)) changedFiles++;
  return {manifest, changedFiles};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const file = process.env.SCENARIO_BUNDLE;
    const info = file ? await lstat(file) : null;
    if (!info?.isFile() || info.size > 20 * 1024 * 1024) throw new Error('SCENARIO_BUNDLE must name a regular JSON bundle of at most 20 MiB.');
    const result = await importScenarioBundle({bundle: JSON.parse(await readFile(file, 'utf8')), expectedRevision: process.env.SOURCE_SHA, runId: process.env.SOURCE_RUN_ID});
    console.log(`Imported ${result.manifest.catalog.length} scenarios (${result.manifest.catalog.filter(entry => entry.draft).length} drafts); changed ${result.changedFiles} files.`);
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
