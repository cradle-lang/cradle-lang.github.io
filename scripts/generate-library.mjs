import {readdir, readFile, writeFile, mkdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const kinds = ['scenarios', 'configurations', 'heuristics'];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function required(data, key, file) {
  if (typeof data[key] !== 'string' || !data[key].trim()) throw new Error(`${file}: ${key} must be a non-empty string`);
  return data[key].trim();
}

export async function readLibrary(root = siteRoot) {
  const sourceRevision = /^[a-f0-9]{40}$/i.test(process.env.GITHUB_SHA || '') ? process.env.GITHUB_SHA : 'main';
  const result = {sourceRevision, scenarios: [], configurations: [], heuristics: []};
  for (const kind of kinds) {
    const directory = path.join(root, 'library', kind);
    const folders = await readdir(directory, {withFileTypes: true}).catch((error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    for (const folder of folders.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!folder.isDirectory() || folder.name.startsWith('_') || folder.name.startsWith('.')) continue;
      const prefix = `library/${kind}/${folder.name}`;
      if (!slugPattern.test(folder.name)) throw new Error(`${prefix}: use a lowercase folder name with hyphens`);
      const files = await readdir(path.join(directory, folder.name));
      const indexes = files.filter((file) => /^index\.mdx?$/.test(file));
      if (indexes.length !== 1) throw new Error(`${prefix}: add exactly one index.md or index.mdx`);
      const docPath = `${prefix}/${indexes[0]}`;
      const {frontMatter: data} = await DEFAULT_PARSE_FRONT_MATTER({filePath: docPath, fileContent: await readFile(path.join(root, docPath), 'utf8')});
      if (data.draft !== undefined && typeof data.draft !== 'boolean') throw new Error(`${docPath}: draft must be true or false`);
      if (data.draft === true) continue;
      if (data.slug !== undefined || data.id !== undefined) throw new Error(`${docPath}: URLs and IDs come from the folder name; remove slug/id`);
      const entry = {
        id: folder.name,
        name: required(data, 'title', docPath),
        description: required(data, 'description', docPath),
        docPath,
        docUrl: `/library/${kind}/${folder.name}`,
      };
      if (kind === 'scenarios') {
        for (const key of ['source', 'category', 'requirements']) entry[key] = required(data, key, docPath);
        if (!Array.isArray(data.tags) || !data.tags.length || !data.tags.every((tag) => typeof tag === 'string' && tag.trim())) throw new Error(`${docPath}: tags must be a non-empty list of strings`);
        entry.tags = data.tags;
        entry.artwork = data.artwork ?? 'auto';
        if (!['auto', 'network', 'enterprise', 'monitoring'].includes(entry.artwork)) throw new Error(`${docPath}: artwork must be auto, network, enterprise or monitoring`);
        if (data.thumbnail !== undefined) {
          const thumbnail = required(data, 'thumbnail', docPath);
          const directoryPath = path.resolve(root, prefix);
          const imagePath = path.resolve(directoryPath, thumbnail);
          if (!imagePath.startsWith(`${directoryPath}${path.sep}`) || !/\.(png|jpe?g|webp|gif)$/i.test(thumbnail)) throw new Error(`${docPath}: thumbnail must be a PNG, JPEG, WebP or GIF inside this scenario folder`);
          if (!(await stat(imagePath).catch(() => null))?.isFile()) throw new Error(`${docPath}: thumbnail file does not exist: ${thumbnail}`);
          entry.thumbnailPath = `${prefix}/${path.relative(directoryPath, imagePath).split(path.sep).join('/')}`;
          entry.thumbnailAlt = required(data, 'thumbnailAlt', docPath);
        }
        entry.file = 'scenario.cradle';
        entry.sourcePath = `${prefix}/scenario.cradle`;
        entry.spec = await readFile(path.join(root, entry.sourcePath), 'utf8').catch(() => {throw new Error(`${docPath}: add scenario.cradle beside the Markdown file`);});
        if (!entry.spec.trim()) throw new Error(`${docPath}: scenario.cradle must not be empty`);
        if (data.deployment) throw new Error(`${docPath}: remove deployment metadata; the library supports validation and compilation only`);
      } else if (kind === 'configurations') {
        entry.key = required(data, 'config', docPath);
        entry.os = required(data, 'os', docPath);
        if (!['Linux', 'Windows', 'Cross-platform', 'Unspecified'].includes(entry.os)) throw new Error(`${docPath}: os must be Linux, Windows, Cross-platform or Unspecified`);
        entry.category = typeof data.category === 'string' ? data.category : 'Other';
      } else {
        entry.type = required(data, 'framework', docPath).toLowerCase();
        entry.value = required(data, 'identifier', docPath);
      }
      result[kind].push(entry);
    }
    const keys = result[kind].map((entry) => kind === 'configurations' ? entry.key : kind === 'heuristics' ? `${entry.type}:${entry.value.toLowerCase()}` : entry.id);
    if (new Set(keys).size !== keys.length) throw new Error(`library/${kind}: duplicate configuration or framework/identifier pair`);
  }
  return result;
}

export async function generateLibrary(root = siteRoot) {
  const result = await readLibrary(root);
  const destination = path.join(root, 'src/data/library.generated.json');
  const serialized = `${JSON.stringify(result, null, 2)}\n`;
  await mkdir(path.dirname(destination), {recursive: true});
  if (await readFile(destination, 'utf8').catch(() => '') !== serialized) await writeFile(destination, serialized);
  // Webpack publishes these sources as real, content-hashed static files.
  // Contributors never need to maintain imports or download URLs themselves.
  const assetsDestination = path.join(root, 'src/data/library-assets.generated.ts');
  const imports = result.scenarios.map((entry, index) => `import asset${index} from ${JSON.stringify(`../../${entry.sourcePath}`)};`);
  const thumbnails = result.scenarios.filter((entry) => entry.thumbnailPath);
  const thumbnailImports = thumbnails.map((entry, index) => `import thumbnail${index} from ${JSON.stringify(`../../${entry.thumbnailPath}`)};`);
  const assets = `${[...imports, ...thumbnailImports].join('\n')}\n\nexport const scenarioAssets: Record<string, string> = {\n${result.scenarios.map((entry, index) => `  ${JSON.stringify(entry.id)}: asset${index},`).join('\n')}\n};\n\nexport const scenarioThumbnails: Record<string, string> = {\n${thumbnails.map((entry, index) => `  ${JSON.stringify(entry.id)}: thumbnail${index},`).join('\n')}\n};\n`;
  if (await readFile(assetsDestination, 'utf8').catch(() => '') !== assets) await writeFile(assetsDestination, assets);
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateLibrary();
  console.log(`Indexed ${result.scenarios.length} scenarios, ${result.configurations.length} configuration articles and ${result.heuristics.length} heuristic articles.`);
}
