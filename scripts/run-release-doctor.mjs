import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {writeJsonFile} from './write-json-file.mjs';
import {createReleaseDoctorCapture} from './release-doctor.mjs';
import {isCommitSha} from './release-identity.mjs';

const [repositoryDirectory, tag, expectedSha, outputPath, diagnosticPath] =
  process.argv.slice(2);

function run(command, arguments_, options = {}) {
  return spawnSync(command, arguments_, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

function requireSuccessful(result, description) {
  if (result.error) {
    throw new Error(`${description} could not start: ${result.error.message}`);
  }
  if (result.signal || result.status !== 0) {
    throw new Error(
      `${description} failed with ${result.signal ?? `exit code ${result.status}`}`,
    );
  }
}

async function main() {
  if (!repositoryDirectory || !tag || !expectedSha || !outputPath || !diagnosticPath) {
    throw new Error(
      'Usage: node scripts/run-release-doctor.mjs <repository-directory> ' +
        '<tag> <expected-sha> <output-path> <diagnostic-path>',
    );
  }
  if (!isCommitSha(expectedSha)) {
    throw new TypeError('Expected doctor commit SHA must contain 40 hexadecimal characters');
  }

  const controlledRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cradlexc-doctor-'),
  );
  const controlledHome = path.join(controlledRoot, 'home');
  const controlledConfig = path.join(controlledRoot, 'config');
  const controlledData = path.join(controlledRoot, 'data');
  const controlledCache = path.join(controlledRoot, 'cache');
  const controlledState = path.join(controlledRoot, 'state');
  await Promise.all([
    fs.mkdir(path.join(controlledHome, '.cxc', 'plugins'), {recursive: true}),
    fs.mkdir(controlledConfig, {recursive: true}),
    fs.mkdir(controlledData, {recursive: true}),
    fs.mkdir(controlledCache, {recursive: true}),
    fs.mkdir(controlledState, {recursive: true}),
    fs.mkdir(path.dirname(outputPath), {recursive: true}),
    fs.mkdir(path.dirname(diagnosticPath), {recursive: true}),
  ]);

  const diagnostic = [];
  try {
    const metadata = run(
      'cargo',
      ['metadata', '--locked', '--no-deps', '--format-version', '1'],
      {cwd: repositoryDirectory},
    );
    diagnostic.push('$ cargo metadata --locked --no-deps --format-version 1');
    diagnostic.push(metadata.stdout ?? '', metadata.stderr ?? '');
    requireSuccessful(metadata, 'Locked Cargo metadata');
    const parsedMetadata = JSON.parse(metadata.stdout);
    const cxcPackage = parsedMetadata.packages.find((package_) =>
      package_.name === 'cradle-cli' &&
      package_.targets.some((target) =>
        target.name === 'cxc' && target.kind.includes('bin'),
      ),
    );
    if (!cxcPackage) {
      throw new Error(
        'Cargo metadata does not define the cradle-cli package with a cxc binary target',
      );
    }

    const controlledTarget = path.join(controlledRoot, 'target');
    const build = run(
      'cargo',
      [
        'build',
        '--locked',
        '-p',
        'cradle-cli',
        '--no-default-features',
        '--target-dir',
        controlledTarget,
      ],
      {
        cwd: repositoryDirectory,
        env: {...process.env, CARGO_TERM_COLOR: 'never'},
      },
    );
    diagnostic.push(
      '$ cargo build --locked -p cradle-cli ' +
        '--no-default-features --target-dir <TEMP>/target',
    );
    diagnostic.push(build.stdout ?? '', build.stderr ?? '');
    requireSuccessful(build, 'Locked core debug build');

    const executable = path.join(
      controlledTarget,
      'debug',
      process.platform === 'win32' ? 'cxc.exe' : 'cxc',
    );
    const actualSha = run('git', ['-C', repositoryDirectory, 'rev-parse', 'HEAD']);
    requireSuccessful(actualSha, 'Upstream commit resolution');
    if (actualSha.stdout.trim().toLowerCase() !== expectedSha.toLowerCase()) {
      throw new Error('Doctor binary source checkout does not match the verified SHA');
    }

    const doctorEnvironment = {
      PATH: process.env.PATH,
      LANG: process.env.LANG ?? 'C.UTF-8',
      LC_ALL: process.env.LC_ALL ?? 'C.UTF-8',
      HOME: controlledHome,
      XDG_CONFIG_HOME: controlledConfig,
      XDG_DATA_HOME: controlledData,
      XDG_CACHE_HOME: controlledCache,
      XDG_STATE_HOME: controlledState,
      NO_COLOR: '1',
      CARGO_TERM_COLOR: 'never',
      TERM: 'dumb',
    };
    const doctor = run(executable, ['doctor'], {
      cwd: controlledRoot,
      env: doctorEnvironment,
    });
    diagnostic.push('$ cxc doctor');
    diagnostic.push(doctor.stdout ?? '', doctor.stderr ?? '');
    if (doctor.error || doctor.signal || doctor.status === null) {
      throw new Error(
        `cxc doctor could not complete: ${doctor.error?.message ?? doctor.signal ?? 'unknown process failure'}`,
      );
    }

    const replacements = {
      [repositoryDirectory]: '<UPSTREAM>',
      [controlledRoot]: '<TEMP>',
      [os.homedir()]: '<HOME>',
      [os.userInfo().username]: '<USER>',
      ...Object.fromEntries(
        Object.entries(process.env)
          .filter(([name, value]) =>
            /(?:SECRET|TOKEN|PASSWORD)/u.test(name) && value,
          )
          .map(([, value]) => [value, '<REDACTED>']),
      ),
    };
    const capture = createReleaseDoctorCapture({
      tag,
      commitSha: expectedSha,
      packageVersion: cxcPackage.version,
      exitCode: doctor.status,
      stdout: doctor.stdout ?? '',
      stderr: doctor.stderr ?? '',
      replacements,
    });
    await writeJsonFile(outputPath, capture);

    if (process.env.GITHUB_OUTPUT) {
      await fs.appendFile(
        process.env.GITHUB_OUTPUT,
        [
          `path=${outputPath}`,
          `sha256=${capture.sha256}`,
          `exit_code=${capture.exitCode}`,
          `dependency_count=${capture.structure.dependencies.length}`,
          '',
        ].join('\n'),
        'utf8',
      );
    }
    console.log(
      `Captured cxc doctor at ${tag} with exit code ${capture.exitCode}.`,
    );
  } finally {
    const replacements = [
      [repositoryDirectory, '<UPSTREAM>'],
      [controlledRoot, '<TEMP>'],
      [os.homedir(), '<HOME>'],
      [os.userInfo().username, '<USER>'],
      ...Object.entries(process.env)
        .filter(([name, value]) =>
          /(?:SECRET|TOKEN|PASSWORD)/u.test(name) && value,
        )
        .map(([, value]) => [value, '<REDACTED>']),
    ].sort(compareLengthDescending);
    let diagnosticText = diagnostic.join('\n');
    for (const [value, replacement] of replacements) {
      diagnosticText = diagnosticText.replaceAll(value, replacement);
    }
    await fs.writeFile(diagnosticPath, diagnosticText, 'utf8');
    await fs.rm(controlledRoot, {recursive: true, force: true});
  }
}

function compareLengthDescending(left, right) {
  return right[0].length - left[0].length;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
