import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {generateLibrary, readLibrary} from './generate-library.mjs';

test('SVG thumbnails generate an image URL and require local files and alternative text', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'cradle-svg-thumbnail-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const folder = path.join(root, 'library/scenarios/custom-art');
  await mkdir(folder, {recursive: true});
  await writeFile(path.join(folder, 'scenario.cradle'), 'metadata() > name("CustomArt").\n');
  await writeFile(path.join(folder, 'preview.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect width="20" height="20"/></svg>');
  const metadata = {title: 'Custom art', description: 'SVG preview', source: 'Test', category: 'Example', tags: ['Test'], requirements: 'None', thumbnail: './preview.svg', thumbnailAlt: 'Training network'};
  async function article(overrides) {
    await writeFile(path.join(folder, 'index.md'), `---\n${JSON.stringify({...metadata, ...overrides})}\n---\n\nPreview.\n`);
  }
  await article({});
  const result = await generateLibrary(root);
  assert.equal(result.scenarios[0].thumbnailPath, 'library/scenarios/custom-art/preview.svg');
  const assets = await readFile(path.join(root, 'src/data/library-assets.generated.ts'), 'utf8');
  assert.match(assets, /require\("!!file-loader\?name=assets\/images\/\[name\]-\[contenthash\]\.\[ext\]!\.\.\/\.\.\/library\/scenarios\/custom-art\/preview\.svg"\)\.default/);
  assert.match(assets, /"custom-art": thumbnail0/);
  await article({thumbnailAlt: undefined});
  await assert.rejects(readLibrary(root), /thumbnailAlt/);
  await article({thumbnail: './missing.svg'});
  await assert.rejects(readLibrary(root), /thumbnail file does not exist/);
  for (const thumbnail of ['../outside.svg', path.join(folder, 'preview.svg'), './unsupported.bmp']) {
    await article({thumbnail});
    await assert.rejects(readLibrary(root), /relative PNG, JPEG, WebP, GIF, SVG or AVIF path/);
  }
});
