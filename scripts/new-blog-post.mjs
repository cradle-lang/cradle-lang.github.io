import {mkdir, readFile, rmdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));

export async function createBlogPost(slug, {root = siteRoot, format = 'md', now = new Date()} = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) {
    throw new Error('Use a lowercase name separated by hyphens, such as my-post.');
  }
  if (!['md', 'mdx'].includes(format)) throw new Error('Choose md or mdx (default: md).');
  // Use the author's local calendar date, including around UTC midnight.
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const folder = `${date}-${slug}`;

  const extension = format;
  const title = slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  const template = (await readFile(path.join(root, 'blog', `_template.${extension}`), 'utf8'))
    .replace(/^title: .+$/m, `title: ${JSON.stringify(title)}`)
    .replace(/^slug: .+$/m, `slug: ${slug}`);
  const directory = path.join(root, 'blog', folder);
  // Reserve a new folder so existing posts, including the other format, stay untouched.
  await mkdir(directory);
  try {
    await writeFile(path.join(directory, `index.${extension}`), template, {flag: 'wx'});
  } catch (error) {
    await rmdir(directory).catch(() => {});
    throw error;
  }
  return `blog/${folder}/index.${extension}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [input, format = 'md', ...extra] = process.argv.slice(2);
    if (extra.length) throw new Error('Provide a post name and an optional format (md or mdx).');
    const article = await createBlogPost(input, {format});
    console.log(`Created ${article}. Edit the draft, then set draft: false when ready to publish.`);
  } catch (error) {
    console.error(error.code === 'EEXIST' ? 'That post folder already exists; its files have not been changed.' : error.message);
    console.error('Usage: npm run blog:new -- <lowercase-name> [md|mdx]');
    process.exitCode = 1;
  }
}
