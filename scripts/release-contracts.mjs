import crypto from 'node:crypto';

import {validateTerminalAgainstDoctor} from './release-doctor.mjs';
import {verifyReleasePreworkIntegrity} from './release-prework.mjs';

export const RELEASE_CONTRACT_SCHEMA_VERSION = 1;

function unique(values) {
  return [...new Set(values)].sort();
}

function payloadOf(report) {
  const {sha256: _sha256, ...payload} = report;
  return payload;
}

export function calculateReleaseContractSha256(report) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payloadOf(report)))
    .digest('hex');
}

export function sourceDispositions(prework, docsChanged) {
  const userDocumentation = new Set([
    ...prework.inventory.cliFiles,
    ...prework.inventory.configurationFiles,
    ...prework.inventory.schemaFiles,
    ...prework.inventory.upstreamDocumentationFiles,
  ]);
  const internal = new Set([
    ...prework.inventory.testFiles,
    ...prework.inventory.ciFiles,
    ...prework.inventory.dependencyFiles,
    ...prework.inventory.buildAndReleaseFiles,
  ]);
  const paths = unique(Object.values(prework.inventory).flat());

  return paths.map((path) => {
    if (userDocumentation.has(path)) {
      return {
        path,
        status: docsChanged ? 'documentation_updated' : 'documentation_missing',
        reason: 'Deterministic user-facing CLI, configuration, schema, or documentation signal.',
      };
    }
    if (internal.has(path)) {
      return {
        path,
        status: 'no_user_documentation_required',
        reason: 'Test, CI, dependency, build, or release-only path.',
      };
    }
    return {
      path,
      status: 'release_note_required',
      reason: 'Source change without a deterministic user-documentation signal.',
    };
  });
}

function allowedPath(path, targetPath) {
  return path === targetPath ||
    path === 'README.rst' ||
    path === 'CONTRIBUTING.md' ||
    path === 'src/pages/index.tsx' ||
    path === 'src/data/homepage-terminal.json' ||
    path.startsWith('docs/') ||
    path.startsWith('src/components/homepage/') ||
    path.startsWith('static/img/home/');
}

export function evaluateReleaseContracts({
  tag,
  targetPath,
  targetContent,
  changedPaths,
  addedLines,
  deletedLines,
  archivedTerminalUnchanged,
  terminal,
  doctorCapture,
  prework,
}) {
  verifyReleasePreworkIntegrity(prework);
  const docsChanged = changedPaths.some((path) => path.startsWith('docs/'));
  const results = [];
  const check = (name, passed, details) => results.push({name, passed, details});

  const disallowed = changedPaths.filter((path) => !allowedPath(path, targetPath));
  check('scope', disallowed.length === 0,
    disallowed.length === 0 ? 'All AI changes use approved paths.' : `Disallowed paths: ${disallowed.join(', ')}`);
  check('release-note-exists', typeof targetContent === 'string' && targetContent.length > 0,
    `Required output: ${targetPath}`);
  check('release-note-heading',
    targetContent?.includes(`# Announcing CradleXC ${tag.replace(/^v/u, '')}`) ?? false,
    'Release-note heading must identify the exact release.');
  check('documentation-impact',
    !prework.classification.requiresUserDocumentation || docsChanged,
    prework.classification.requiresUserDocumentation
      ? 'At least one docs/** update is required.'
      : 'No docs/** update is required by deterministic classification.');
  check('historical-terminal-immutability', archivedTerminalUnchanged,
    'Entries under homepage-terminal.json .versions must remain unchanged.');

  try {
    validateTerminalAgainstDoctor({terminal, capture: doctorCapture, tag});
    check('doctor-transcript', true, 'Current terminal matches the controlled doctor structure.');
  } catch (error) {
    check('doctor-transcript', false, error.message);
  }

  const deletionRisk = deletedLines > 200 && deletedLines > addedLines * 2;
  const deletionJustified = prework.riskIndicators.some((indicator) =>
    ['file-removal', 'file-rename', 'possible-breaking-change'].includes(indicator),
  );
  check('deletion-guard', !deletionRisk || deletionJustified,
    `${addedLines} added and ${deletedLines} deleted tracked line(s); ` +
      `upstream deletion justification: ${deletionJustified}.`);

  const dispositions = sourceDispositions(prework, docsChanged);
  const missingDispositions = dispositions.filter(({status}) =>
    status === 'documentation_missing',
  );
  check('source-coverage', missingDispositions.length === 0,
    missingDispositions.length === 0
      ? `${dispositions.length} relevant upstream path(s) received a disposition.`
      : `Missing documentation disposition: ${missingDispositions.map(({path}) => path).join(', ')}`);

  const payload = {
    schemaVersion: RELEASE_CONTRACT_SCHEMA_VERSION,
    release: {tag},
    passed: results.every(({passed}) => passed),
    results,
    sourceDispositions: dispositions,
  };
  return {...payload, sha256: calculateReleaseContractSha256(payload)};
}
