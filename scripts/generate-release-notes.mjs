import fs from 'node:fs/promises';
import path from 'node:path';

const RELEASE_NOTES_DIRECTORY = path.resolve('release-notes');
const OUTPUT_FILE = path.resolve('src/data/release-notes.json');
const RELEASE_NOTE_FILE = /^v(.+)\.md$/i;

function parseVersion(fileName) {
  const version = fileName.slice(1, -3);
  const match = version.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/,
  );

  if (!match) {
    return null;
  }

  return {
    numbers: match.slice(1, 4).map(Number),
    prerelease: match[4]?.split('.') ?? [],
  };
}

function comparePrerelease(left, right) {
  if (left.length === 0 || right.length === 0) {
    return left.length === right.length ? 0 : left.length === 0 ? 1 : -1;
  }

  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if (left[index] === undefined || right[index] === undefined) {
      return left[index] === right[index] ? 0 : left[index] === undefined ? -1 : 1;
    }

    const leftNumber = /^\d+$/.test(left[index]) ? Number(left[index]) : null;
    const rightNumber = /^\d+$/.test(right[index]) ? Number(right[index]) : null;

    if (leftNumber !== null && rightNumber !== null && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    if (leftNumber !== null && rightNumber === null) {
      return -1;
    }

    if (leftNumber === null && rightNumber !== null) {
      return 1;
    }

    const comparison = left[index].localeCompare(right[index]);
    if (comparison !== 0) {
      return comparison;
    }
  }

  return 0;
}

function compareReleaseNotes(left, right) {
  const leftVersion = parseVersion(left);
  const rightVersion = parseVersion(right);

  if (!leftVersion || !rightVersion) {
    return left.localeCompare(right, undefined, {numeric: true});
  }

  for (let index = 0; index < 3; index += 1) {
    if (leftVersion.numbers[index] !== rightVersion.numbers[index]) {
      return leftVersion.numbers[index] - rightVersion.numbers[index];
    }
  }

  return comparePrerelease(leftVersion.prerelease, rightVersion.prerelease);
}

async function main() {
  const entries = await fs.readdir(RELEASE_NOTES_DIRECTORY, {
    withFileTypes: true,
  });

  const fileNames = entries
    .filter((entry) => entry.isFile() && RELEASE_NOTE_FILE.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareReleaseNotes);

  const releaseNotes = await Promise.all(
    fileNames.map(async (fileName) => ({
      version: fileName.slice(0, -3),
      fileName,
      content: await fs.readFile(
        path.join(RELEASE_NOTES_DIRECTORY, fileName),
        'utf8',
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
