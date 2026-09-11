import fs from 'node:fs/promises';

import {
  deriveReleaseQueue,
  normalizeReleaseQueueSignals,
  parseUpstreamReleaseInventory,
  readCompletedReleaseTags,
} from './release-reconciler.mjs';
import {
  readReleaseEvidence,
  verifyReleaseEvidenceMetadata,
} from './release-evidence.mjs';
import {
  readReleaseProvenance,
  verifyCompletedReleaseProvenance,
} from './release-provenance.mjs';
import {releasePolicy} from './release-policy.mjs';

const [
  upstreamTagsFile,
  releaseNoteDirectory = 'release-notes',
  queueSignalsFile,
  queueOutputFile,
] = process.argv.slice(2);

async function main() {
  if (!upstreamTagsFile) {
    throw new Error(
      'Usage: node scripts/reconcile-cradlexc-releases.mjs ' +
        '<upstream-tags-file> [release-notes-directory] ' +
        '[queue-signals-file] [queue-output-file]',
    );
  }

  const tagFileContent = await fs.readFile(
    upstreamTagsFile,
    'utf8',
  );

  const upstreamReleases = parseUpstreamReleaseInventory(tagFileContent);

  if (upstreamReleases.length === 0) {
    throw new Error(
      `Upstream release inventory is empty: ${upstreamTagsFile}`,
    );
  }

  const completedTags = await readCompletedReleaseTags(releaseNoteDirectory);
  const provenanceRecords = await readReleaseProvenance(releaseNoteDirectory);
  const evidenceRecords = await readReleaseEvidence(releaseNoteDirectory);

  verifyCompletedReleaseProvenance({
    completedTags,
    upstreamReleases,
    provenanceRecords,
    exemptTags: releasePolicy.provenanceExemptTags,
  });

  const evidenceByTag = verifyReleaseEvidenceMetadata({
    completedTags,
    upstreamReleases,
    evidenceRecords,
    provenanceRecords,
    exemptTags: releasePolicy.provenanceExemptTags,
  });

  const signals = queueSignalsFile
    ? normalizeReleaseQueueSignals(
      JSON.parse(await fs.readFile(queueSignalsFile, 'utf8')),
    )
    : normalizeReleaseQueueSignals();

  const result = deriveReleaseQueue({
    upstreamReleases,
    completedTags,
    evidenceTags: [...evidenceByTag.keys()],
    signals,
  });
  const selectedRelease = result.selected;

  console.log('Eligible releases:', result.eligible);
  console.log('Completed releases:', result.completed);
  console.log('Outstanding releases:', result.outstanding);
  console.log('Selected release:', selectedRelease?.tag ?? 'none');
  console.log('Selected commit SHA:', selectedRelease?.sha ?? 'none');
  console.log('Selected queue state:', selectedRelease?.state ?? 'none');

  if (queueOutputFile) {
    await fs.writeFile(
      queueOutputFile,
      `${JSON.stringify(result, null, 2)}\n`,
      'utf8',
    );
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const rows = result.releases.map(
      ({tag, sha, state}) => `| ${tag} | \`${sha}\` | ${state} |`,
    );
    await fs.appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '## CradleXC release queue',
        '',
        '| Release | Commit | State |',
        '| --- | --- | --- |',
        ...rows,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `has_outstanding=${selectedRelease !== null}`,
      `selected=${selectedRelease?.tag ?? ''}`,
      `selected_sha=${selectedRelease?.sha ?? ''}`,
      `selected_state=${selectedRelease?.state ?? ''}`,
      `should_dispatch=${result.shouldDispatch}`,
      `eligible=${JSON.stringify(result.eligible)}`,
      `completed=${JSON.stringify(result.completed)}`,
      `outstanding=${JSON.stringify(result.outstanding)}`,
      `queue=${JSON.stringify(result.releases)}`,
      '',
    ].join('\n');

    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      output,
      'utf8',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
