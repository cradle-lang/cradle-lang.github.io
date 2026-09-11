import fs from 'node:fs/promises';
import path from 'node:path';

import {
  compareReleaseTags,
  isProductionRelease,
  releaseNoteFileToTag,
} from './release-policy.mjs';

const RELEASE_NOTES_DIRECTORY = path.resolve('release-notes');
const OUTPUT_FILE = path.resolve('src/data/release-notes.json');
const RELEASE_NOTE_FILE = /^v(.+)\.md$/i;

function stripMarkdownlintDirectives(content) {
  return content.replace(
    /<!--\s*markdownlint-[\s\S]*?-->\r?\n?/g,
    '',
  );
}

function compareReleaseNotes(left, right) {
  const leftTag = releaseNoteFileToTag(left);
  const rightTag = releaseNoteFileToTag(right);

  if (!leftTag || !rightTag) {
    return left.localeCompare(right, undefined, {numeric: true});
  }

  return compareReleaseTags(leftTag, rightTag);
}

async function main() {
  const entries = await fs.readdir(RELEASE_NOTES_DIRECTORY, {
    withFileTypes: true,
  });

  const fileNames = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        RELEASE_NOTE_FILE.test(entry.name) &&
        isProductionRelease(releaseNoteFileToTag(entry.name)),
    )
    .map((entry) => entry.name)
    .sort(compareReleaseNotes);

  const releaseNotes = await Promise.all(
    fileNames.map(async (fileName) => ({
      version: fileName.slice(0, -3),
      fileName,
      content: stripMarkdownlintDirectives(
        await fs.readFile(
          path.join(RELEASE_NOTES_DIRECTORY, fileName),
          'utf8',
        ),
      ),
    })),
  );

  await fs.mkdir(path.dirname(OUTPUT_FILE), {recursive: true});
  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(releaseNotes, null, 2)}\n`,
    'utf8',
  );

  console.log(`Indexed ${releaseNotes.length} local release note(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
