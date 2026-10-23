import {cp, mkdir, readFile, readdir, rename, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const kinds = {scenario: 'scenarios', configuration: 'configurations', heuristic: 'heuristics'};
export async function createLibraryEntry(kind, slug, {root = siteRoot, mdx = false} = {}) {
  if (!Object.hasOwn(kinds, kind) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) {
    throw new Error('Use scenario, configuration or heuristic, followed by a lowercase folder name with hyphens.');
  }
  const relative = `library/${kinds[kind]}/${slug}`;
  const destination = path.join(root, relative);
  await mkdir(path.dirname(destination), {recursive: true});
  // Fail before copying if an entry already exists. Never overwrite its files.
  await mkdir(destination);
  const template = path.join(siteRoot, 'library/_templates', kind);
  for (const file of await readdir(template)) {
    await cp(path.join(template, file), path.join(destination, file), {recursive: true, force: false, errorOnExist: true});
  }
  const article = path.join(destination, 'index.md');
  let markdown = await readFile(article, 'utf8');
  const title = slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  markdown = markdown.replace(/^title: .+$/m, `title: ${JSON.stringify(title)}`);
  if (kind === 'configuration') markdown = markdown.replace(/^config: .+$/m, `config: ${slug}`);
  await writeFile(article, markdown);
  if (mdx) await rename(path.join(destination, 'index.md'), path.join(destination, 'index.mdx'));
  return relative;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [kind, slug, format, ...extra] = process.argv.slice(2);
  try {
    if (extra.length || (format && format !== '--mdx')) throw new Error('The only optional flag is --mdx.');
    const relative = await createLibraryEntry(kind, slug, {mdx: format === '--mdx'});
    console.log(`Created ${relative}. Fill in index.${format ? 'mdx' : 'md'}, add your files, then set draft: false when ready.`);
  } catch (error) {
    console.error(error.code === 'EEXIST' ? 'That library entry already exists; its files have not been changed.' : error.message);
    console.error('Usage: npm run library:new -- <scenario|configuration|heuristic> <lowercase-folder-name> [--mdx]');
    process.exitCode = 1;
  }
}
