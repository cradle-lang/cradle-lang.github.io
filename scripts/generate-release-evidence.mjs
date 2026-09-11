import fs from 'node:fs/promises';

import {
  collectReleaseEvidence,
  writeReleaseEvidence,
} from './release-evidence.mjs';

const [repositoryDirectory, outputDirectory, fromTag, toTag] =
  process.argv.slice(2);

async function main() {
  if (!repositoryDirectory || !outputDirectory || !fromTag || !toTag) {
    throw new Error(
      'Usage: node scripts/generate-release-evidence.mjs ' +
        '<repository-directory> <output-directory> <from-tag> <to-tag>',
    );
  }

  const evidence = collectReleaseEvidence({
    repositoryDirectory,
    fromTag,
    toTag,
  });
  const outputPath = await writeReleaseEvidence(outputDirectory, evidence);

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [
        `path=${outputPath}`,
        `sha256=${evidence.sha256}`,
        `commit_count=${evidence.counts.commits}`,
        `file_count=${evidence.counts.files}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  console.log(
    `Wrote evidence for ${fromTag}..${toTag} to ${outputPath} ` +
      `(${evidence.counts.commits} commits, ${evidence.counts.files} files).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
