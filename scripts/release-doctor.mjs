import crypto from 'node:crypto';

import {isCommitSha} from './release-identity.mjs';

export const RELEASE_DOCTOR_SCHEMA_VERSION = 1;

const ANSI_ESCAPE = /\u001b(?:\[[0-?]*[ -/]*[@-~]|\][^\u0007]*(?:\u0007|\u001b\\))/g;
const FIELD = /^\s{0,4}([A-Za-z][A-Za-z0-9 _/-]*):(?:\s|$)/;

function compareLengthDescending(left, right) {
  return right[0].length - left[0].length;
}

export function normalizeDoctorOutput(output, replacements = {}) {
  let normalized = output
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(ANSI_ESCAPE, '');

  for (const [value, replacement] of Object.entries(replacements)
    .filter(([value]) => value)
    .sort(compareLengthDescending)) {
    normalized = normalized.replaceAll(value, replacement);
  }

  return normalized
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/\n+$/u, '');
}

export function analyzeDoctorOutput(output) {
  const lines = output.split('\n');
  const nonempty = lines.map((line) => line.trim()).filter(Boolean);
  const dependencyHeaderIndex = lines.findIndex((line) =>
    /\bDependency\b.*\bStatus\b/i.test(line),
  );
  const dependencies = [];
  if (dependencyHeaderIndex !== -1) {
    for (const line of lines.slice(dependencyHeaderIndex + 1)) {
      const trimmed = line.trim();
      if (!trimmed) {
        break;
      }
      if (/^-{3,}$/u.test(trimmed)) {
        continue;
      }
      const name = trimmed.split(/\s{2,}/u)[0];
      if (name && !dependencies.includes(name)) {
        dependencies.push(name);
      }
    }
  }

  return {
    banner: nonempty[0] ?? '',
    headings: [...new Set(lines
      .map((line) => line.trim())
      .filter((line) =>
        line.endsWith(':') || /\bDependency\b.*\bStatus\b/i.test(line),
      ))],
    fieldNames: [...new Set(lines
      .map((line) => line.match(FIELD)?.[1]?.trim())
      .filter(Boolean))],
    dependencies,
    outcomeLines: [...new Set(lines
      .map((line) => line.trim())
      .filter((line) =>
        /\b(dependenc(?:y|ies)|environment)\b/i.test(line) &&
        /\b(ok|installed|missing|available|found|failed|ready|problem)\b/i.test(line),
      ))],
  };
}

function capturePayload(capture) {
  const {sha256: _sha256, ...payload} = capture;
  return payload;
}

export function calculateReleaseDoctorSha256(capture) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(capturePayload(capture)))
    .digest('hex');
}

export function createReleaseDoctorCapture({
  tag,
  commitSha,
  packageVersion,
  exitCode,
  stdout,
  stderr,
  replacements = {},
}) {
  if (!isCommitSha(commitSha)) {
    throw new TypeError('Doctor capture requires a full commit SHA');
  }
  if (!Number.isInteger(exitCode)) {
    throw new TypeError('Doctor capture requires an integer exit code');
  }
  if (packageVersion !== tag.replace(/^v/u, '')) {
    throw new Error(
      `CradleXC package version ${packageVersion} does not match release ${tag}`,
    );
  }

  const normalizedStdout = normalizeDoctorOutput(stdout, replacements);
  const normalizedStderr = normalizeDoctorOutput(stderr, replacements);
  const structure = analyzeDoctorOutput(normalizedStdout);
  const version = tag.replace(/^v/u, '');
  if (!structure.banner || !structure.banner.includes(version)) {
    throw new Error(`Doctor banner does not identify release ${tag}`);
  }

  const payload = {
    schemaVersion: RELEASE_DOCTOR_SCHEMA_VERSION,
    release: {tag, sha: commitSha.toLowerCase(), packageVersion},
    command: 'cxc doctor',
    exitCode,
    stdout: normalizedStdout,
    stderr: normalizedStderr,
    structure,
  };
  return {...payload, sha256: calculateReleaseDoctorSha256(payload)};
}

export function verifyReleaseDoctorIntegrity(capture) {
  if (capture.schemaVersion !== RELEASE_DOCTOR_SCHEMA_VERSION) {
    throw new Error(`Unsupported release doctor schema: ${capture.schemaVersion}`);
  }
  if (capture.sha256 !== calculateReleaseDoctorSha256(capture)) {
    throw new Error('Release doctor checksum does not match its contents');
  }
  return capture;
}

function arraysEqual(left, right) {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

export function validateTerminalAgainstDoctor({terminal, capture, tag}) {
  verifyReleaseDoctorIntegrity(capture);
  if (capture.release.tag !== tag) {
    throw new Error('Doctor capture does not belong to the requested release');
  }
  if (terminal.tag !== tag || terminal.command !== 'cxc doctor') {
    throw new Error('Terminal tag or command does not match the doctor capture');
  }
  if (!Array.isArray(terminal.output) || terminal.output.length === 0) {
    throw new Error('Terminal transcript must contain output lines');
  }

  const transcript = normalizeDoctorOutput(terminal.output.join('\n'));
  const structure = analyzeDoctorOutput(transcript);
  if (structure.banner !== capture.structure.banner) {
    throw new Error('Terminal banner does not match the captured doctor banner');
  }
  if (!arraysEqual(structure.headings, capture.structure.headings)) {
    throw new Error('Terminal doctor headings do not match the captured headings');
  }
  if (!arraysEqual(structure.fieldNames, capture.structure.fieldNames)) {
    throw new Error('Terminal doctor fields do not match the captured fields');
  }
  if (!arraysEqual(structure.dependencies, capture.structure.dependencies)) {
    throw new Error(
      'Terminal dependency checks do not match the captured dependency checks',
    );
  }
  if (!arraysEqual(structure.outcomeLines, capture.structure.outcomeLines)) {
    throw new Error('Terminal doctor outcomes do not match the captured outcomes');
  }

  const expectedAriaTerm = capture.exitCode === 0
    ? /success|ready|installed|available/i
    : /fail|problem|missing|unavailable/i;
  if (!expectedAriaTerm.test(terminal.ariaLabel ?? '')) {
    throw new Error('Terminal accessible label does not describe the doctor result');
  }
  return terminal;
}
