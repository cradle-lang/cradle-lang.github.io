import assert from 'node:assert/strict';
import test from 'node:test';

import {evaluateReleaseContracts} from './release-contracts.mjs';
import {createReleaseDoctorCapture} from './release-doctor.mjs';
import {createReleaseEvidence} from './release-evidence.mjs';
import {createReleasePrework} from './release-prework.mjs';

const SHA_18 = '1818181818181818181818181818181818181818';
const SHA_19 = '1919191919191919191919191919191919191919';
const output = [
  'CRADLE v0.19.0 — dependency check', '',
  'Dependency  Status', '------------------', 'git         ✓ OK', '',
  '✓ All required dependencies are installed.', '',
  'Configuration:', '  Config file: <TEMP>/config.toml',
].join('\n');

function fixtures(overrides = {}) {
  const evidence = createReleaseEvidence({
    fromTag: 'v0.18.1', fromSha: SHA_18,
    toTag: 'v0.19.0', toSha: SHA_19, mergeBaseSha: SHA_18,
    commits: [{sha: SHA_19, subject: 'Add backend flag'}],
    files: [{status: 'modified', path: 'src/cli/backend.rs'}],
  });
  const prework = createReleasePrework({
    evidence,
    diff: '+command.arg("--backend")\n',
  });
  const doctorCapture = createReleaseDoctorCapture({
    tag: 'v0.19.0', commitSha: SHA_19, packageVersion: '0.19.0',
    exitCode: 0, stdout: output, stderr: '',
  });
  return {
    tag: 'v0.19.0',
    targetPath: 'release-notes/v0.19.0.md',
    targetContent: '# Announcing CradleXC 0.19.0\n',
    changedPaths: ['release-notes/v0.19.0.md', 'docs/cli/backend.md', 'src/data/homepage-terminal.json'],
    addedLines: 30,
    deletedLines: 5,
    archivedTerminalUnchanged: true,
    terminal: {
      tag: 'v0.19.0', command: 'cxc doctor',
      ariaLabel: 'Successful CradleXC dependency check',
      output: output.split('\n'),
    },
    doctorCapture,
    prework,
    ...overrides,
  };
}

test('passes all release regression contracts and records source dispositions', () => {
  const report = evaluateReleaseContracts(fixtures());
  assert.equal(report.passed, true);
  assert.deepEqual(report.sourceDispositions, [{
    path: 'src/cli/backend.rs',
    status: 'documentation_updated',
    reason: 'Deterministic user-facing CLI, configuration, schema, or documentation signal.',
  }]);
  assert.match(report.sha256, /^[0-9a-f]{64}$/u);
});

test('reports scope, documentation, terminal, history and deletion failures together', () => {
  const brokenTerminal = {...fixtures().terminal, output: ['invented']};
  const report = evaluateReleaseContracts(fixtures({
    changedPaths: ['release-notes/v0.19.0.md', 'package.json'],
    archivedTerminalUnchanged: false,
    addedLines: 10,
    deletedLines: 500,
    terminal: brokenTerminal,
  }));

  assert.equal(report.passed, false);
  assert.deepEqual(
    report.results.filter(({passed}) => !passed).map(({name}) => name),
    ['scope', 'documentation-impact', 'historical-terminal-immutability', 'doctor-transcript', 'deletion-guard', 'source-coverage'],
  );
});
