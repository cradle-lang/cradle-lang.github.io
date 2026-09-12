import fs from 'node:fs/promises';

import {
  buildReleaseAiContext,
  writeReleaseAiContext,
} from './release-ai-context.mjs';

const [
  repositoryDirectory,
  evidencePath,
  preworkPath,
  doctorCapturePath,
  previousReleaseNotePath,
  outputPath,
] = process.argv.slice(2);

async function main() {
  if (
    !repositoryDirectory ||
    !evidencePath ||
    !preworkPath ||
    !doctorCapturePath ||
    !previousReleaseNotePath ||
    !outputPath
  ) {
    throw new Error(
      'Usage: node scripts/generate-release-ai-context.mjs ' +
        '<repository-directory> <evidence-path> <prework-path> ' +
        '<doctor-capture-path> <previous-release-note-path> <output-path>',
    );
  }

  const [evidence, prework, doctorCapture] = await Promise.all([
    fs.readFile(evidencePath, 'utf8').then(JSON.parse),
    fs.readFile(preworkPath, 'utf8').then(JSON.parse),
    fs.readFile(doctorCapturePath, 'utf8').then(JSON.parse),
  ]);
  const context = await buildReleaseAiContext({
    repositoryDirectory,
    evidence,
    prework,
    doctorCapture,
    previousReleaseNotePath,
  });
  await writeReleaseAiContext(outputPath, context);

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      [
        `path=${outputPath}`,
        `sha256=${context.sha256}`,
        `upstream_file_count=${context.upstreamFiles.length}`,
        `documentation_file_count=${context.documentationFiles.length}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  console.log(
    `Wrote bounded AI context with ${context.upstreamFiles.length} upstream ` +
      `and ${context.documentationFiles.length} documentation file(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
