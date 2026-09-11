import {writeReleaseProvenance} from './release-provenance.mjs';

const [
  releaseNotesDirectory,
  tag,
  commitSha,
  previousTag,
  previousCommitSha,
] = process.argv.slice(2);

async function main() {
  if (!releaseNotesDirectory || !tag || !commitSha || !previousTag || !previousCommitSha) {
    throw new Error(
      'Usage: node scripts/write-release-provenance.mjs ' +
        '<release-notes-directory> <tag> <commit-sha> ' +
        '<previous-tag> <previous-commit-sha>',
    );
  }

  const outputPath = await writeReleaseProvenance(
    releaseNotesDirectory,
    {tag, commitSha, previousTag, previousCommitSha},
  );

  console.log(`Wrote release provenance to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
