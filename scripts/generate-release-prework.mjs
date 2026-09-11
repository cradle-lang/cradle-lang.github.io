import fs from 'node:fs/promises';

import {
  buildReleasePrework,
  writeReleasePrework,
} from './release-prework.mjs';

const [
  repositoryDirectory,
  evidencePath,
  documentationDirectory,
  outputDirectory,
] = process.argv.slice(2);

async function main() {
  if (
    !repositoryDirectory ||
    !evidencePath ||
    !documentationDirectory ||
    !outputDirectory
  ) {
    throw new Error(
      'Usage: node scripts/generate-release-prework.mjs ' +
        '<repository-directory> <evidence-path> ' +
        '<documentation-directory> <output-directory>',
    );
  }

  const evidence = JSON.parse(await fs.readFile(evidencePath, 'utf8'));
  const prework = await buildReleasePrework({
    repositoryDirectory,
    evidence,
    documentationDirectory,
  });
  const outputPath = await writeReleasePrework(outputDirectory, prework);

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [
        `path=${outputPath}`,
        `sha256=${prework.sha256}`,
        `classification=${prework.classification.level}`,
        `requires_documentation=${prework.classification.requiresUserDocumentation}`,
        `risk_count=${prework.riskIndicators.length}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  console.log(
    `Prepared ${prework.release.tag} as ${prework.classification.level} ` +
      `with ${prework.riskIndicators.length} risk indicator(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
