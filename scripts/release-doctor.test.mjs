import assert from 'node:assert/strict';
import test from 'node:test';

import {
  analyzeDoctorOutput,
  createReleaseDoctorCapture,
  normalizeDoctorOutput,
  validateTerminalAgainstDoctor,
  verifyReleaseDoctorIntegrity,
} from './release-doctor.mjs';

const SHA = '1919191919191919191919191919191919191919';
const OUTPUT = [
  'CRADLE v0.19.0 — dependency check',
  '',
  'Dependency          Status     Purpose',
  '---------------------------------------',
  'git                 ✓ OK       source retrieval [/usr/bin/git]',
  'optional-tool       ✗ MISSING  optional integration',
  '',
  '✓ All required dependencies are installed.',
  '',
  'Configuration:',
  '  Config file: <TEMP>/config.toml',
  '  Config dir:  <TEMP>/configs',
].join('\n');

function capture(exitCode = 0) {
  return createReleaseDoctorCapture({
    tag: 'v0.19.0',
    commitSha: SHA,
    packageVersion: '0.19.0',
    exitCode,
    stdout: OUTPUT,
    stderr: '',
  });
}

function terminal(overrides = {}) {
  return {
    tag: 'v0.19.0',
    command: 'cxc doctor',
    ariaLabel: 'Successful CradleXC dependency check',
    output: OUTPUT.split('\n'),
    ...overrides,
  };
}

test('normalizes ANSI, line endings and machine-specific paths', () => {
  assert.equal(
    normalizeDoctorOutput(
      '\u001b[32m/home/runner/work\u001b[0m  \r\n',
      {'/home/runner/work': '<WORKSPACE>'},
    ),
    '<WORKSPACE>',
  );
});

test('extracts doctor headings, fields, dependencies and outcomes', () => {
  assert.deepEqual(analyzeDoctorOutput(OUTPUT), {
    banner: 'CRADLE v0.19.0 — dependency check',
    headings: ['Dependency          Status     Purpose', 'Configuration:'],
    fieldNames: ['Configuration', 'Config file', 'Config dir'],
    dependencies: ['git', 'optional-tool'],
    outcomeLines: ['✓ All required dependencies are installed.'],
  });
});

test('accepts a structurally faithful curated terminal transcript', () => {
  const doctorCapture = capture();
  assert.doesNotThrow(() => verifyReleaseDoctorIntegrity(doctorCapture));
  assert.equal(
    validateTerminalAgainstDoctor({
      terminal: terminal(),
      capture: doctorCapture,
      tag: 'v0.19.0',
    }).tag,
    'v0.19.0',
  );
});

test('rejects a package version that differs from the release tag', () => {
  assert.throws(
    () => createReleaseDoctorCapture({
      tag: 'v0.19.0',
      commitSha: SHA,
      packageVersion: '0.18.1',
      exitCode: 0,
      stdout: OUTPUT,
      stderr: '',
    }),
    /package version .* does not match release/,
  );
});

test('rejects invented fields, dependencies and changed outcomes', () => {
  const doctorCapture = capture();
  const inventedField = terminal({
    output: [...terminal().output, '  Imaginary field: value'],
  });
  assert.throws(
    () => validateTerminalAgainstDoctor({
      terminal: inventedField,
      capture: doctorCapture,
      tag: 'v0.19.0',
    }),
    (error) => {
      assert.match(error.message, /Terminal doctor fields do not match/);
      assert.match(
        error.message,
        /Expected: \["Configuration","Config file","Config dir"\]/,
      );
      assert.match(
        error.message,
        /Observed: \["Configuration","Config file","Config dir","Imaginary field"\]/,
      );
      assert.match(error.message, /Missing: \[\]/);
      assert.match(error.message, /Unexpected: \["Imaginary field"\]/);
      return true;
    },
  );

  const inventedHeading = terminal({
    output: [...terminal().output, '', 'Imaginary section:'],
  });
  assert.throws(
    () => validateTerminalAgainstDoctor({
      terminal: inventedHeading,
      capture: doctorCapture,
      tag: 'v0.19.0',
    }),
    /headings do not match/,
  );

  const inventedDependency = terminal({
    output: terminal().output.map((line) =>
      line.startsWith('git ') ? 'invented-tool       ✓ OK       made up' : line,
    ),
  });
  assert.throws(
    () => validateTerminalAgainstDoctor({
      terminal: inventedDependency,
      capture: doctorCapture,
      tag: 'v0.19.0',
    }),
    /dependency checks do not match/,
  );

  const omittedDependency = terminal({
    output: terminal().output.filter((line) =>
      !line.startsWith('optional-tool '),
    ),
  });
  assert.throws(
    () => validateTerminalAgainstDoctor({
      terminal: omittedDependency,
      capture: doctorCapture,
      tag: 'v0.19.0',
    }),
    /dependency checks do not match/,
  );

  const changedOutcome = terminal({
    output: terminal().output.filter((line) => !line.startsWith('✓ All required')),
  });
  assert.throws(
    () => validateTerminalAgainstDoctor({
      terminal: changedOutcome,
      capture: doctorCapture,
      tag: 'v0.19.0',
    }),
    /outcomes do not match/,
  );
});

test('requires an accessible label that reflects a failing doctor result', () => {
  assert.throws(
    () => validateTerminalAgainstDoctor({
      terminal: terminal(),
      capture: capture(1),
      tag: 'v0.19.0',
    }),
    /accessible label/,
  );
});
