import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {readLibrary} from './generate-library.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const entries = await readLibrary(root);
for (const scenario of entries.scenarios) {
  test(`${scenario.id}: Docusaurus renders the article and bundles the downloadable source`, async () => {
    const html = await readFile(path.join(root, 'build', scenario.docUrl, 'index.html'), 'utf8');
    assert.ok(html.includes(scenario.name));
    assert.ok(!html.includes('href="undefined"'));
    assert.ok(!html.includes('Edit this page'), 'Library guides must not offer page editing');
    const downloadAnchor = html.match(/<a\b[^>]*href="[^"\s]*\/assets\/files\/[^"\s]*\.cradle"[^>]*>/);
    assert.ok(downloadAnchor && /\bdownload(?:=|\s|>)/.test(downloadAnchor[0]), 'specification links must download rather than navigate to raw source');
    const download = html.match(/href="([^"\s]*\/assets\/files\/[^"\s]*\.cradle)"/);
    assert.ok(download, 'relative Markdown specification links must resolve to real assets');
    assert.equal(await readFile(path.join(root, 'build', download[1]), 'utf8'), scenario.spec);
    assert.equal(new URL(download[1], 'https://cradle-lang.org').origin, 'https://cradle-lang.org');
    assert.ok(html.includes(`https://cradle-lang.org${scenario.docUrl}`), 'published articles must use the configured production domain');
  });
}
test('manually authored configuration articles are rendered as HTML', async () => {
  for (const configuration of entries.configurations) {
    const html = await readFile(path.join(root, 'build', configuration.docUrl, 'index.html'), 'utf8');
    assert.ok(html.includes(configuration.name));
    assert.ok(html.includes(configuration.description));
    assert.ok(!html.includes('Edit this page'), 'Library articles must not offer page editing');
  }
});
