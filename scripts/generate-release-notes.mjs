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
const SNAPSHOT_ARGUMENT = '--snapshot';

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
  const snapshotIndex = process.argv.indexOf(SNAPSHOT_ARGUMENT);
  const snapshotVersion = snapshotIndex === -1
    ? null
    : process.argv[snapshotIndex + 1];

  if (snapshotIndex !== -1 && !snapshotVersion) {
    throw new Error('Usage: generate-release-notes.mjs [--snapshot <version>]');
  }

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

  let existingData = {versions: {}};

  try {
    const parsed = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8'));

    if (!Array.isArray(parsed) && parsed?.versions) {
      existingData = {
        versions: parsed.versions,
      };
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const output = snapshotVersion
    ? {
        // The current index is a build artifact. Keep the committed data small
        // and persist only immutable archived snapshots.
        current: [],
        versions: {
          ...existingData.versions,
          [snapshotVersion]: releaseNotes.filter((note) =>
            compareReleaseTags(note.version, `v${snapshotVersion}`) <= 0,
          ),
        },
      }
    : {
        current: releaseNotes,
        versions: existingData.versions,
      };

  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  );

  console.log(
    snapshotVersion
      ? `Snapshotted ${output.versions[snapshotVersion].length} release note(s) for ${snapshotVersion}.`
      : `Indexed ${releaseNotes.length} local release note(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
