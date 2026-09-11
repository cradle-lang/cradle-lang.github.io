import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import {verifyReleaseEvidenceIntegrity} from './release-evidence.mjs';

export const RELEASE_PREWORK_SCHEMA_VERSION = 1;

export const DOCUMENTATION_IMPACT = Object.freeze({
  INTERNAL_ONLY: 'INTERNAL_ONLY',
  RELEASE_NOTE_ONLY: 'RELEASE_NOTE_ONLY',
  SMALL_USER_FACING: 'SMALL_USER_FACING',
  COMPLEX_USER_FACING: 'COMPLEX_USER_FACING',
});

const FLAG = /--[a-zA-Z0-9][a-zA-Z0-9-]*/g;
const TEST_PATH = /(^|\/)(tests?|spec|fixtures?)(\/|$)/i;
const CI_PATH = /^\.github\//i;
const CLI_PATH = /(^|\/)(cli|commands?)(\/|\.|$)/i;
const CONFIG_PATH = /(^|\/)(config|configuration|settings?)(\/|\.|$)/i;
const SCHEMA_PATH = /(^|\/)(schemas?)(\/|\.|$)|\.schema\.json$/i;
const DOCUMENTATION_PATH = /(^|\/)(docs?|examples?)(\/|$)|(^|\/)README(?:\.|$)/i;
const DEPENDENCY_PATH = /(^|\/)(Cargo\.(toml|lock)|package(-lock)?\.json|requirements[^/]*|pyproject\.toml)$/i;
const BUILD_RELEASE_PATH = /(^|\/)(build|scripts?)(\/|\.|$)|(^|\/)(Makefile|Dockerfile)$/i;
const BREAKING_SUBJECT = /\b(breaking|deprecat(?:e|ed|ion)|remov(?:e|ed|al)|renam(?:e|ed))\b/i;
const IGNORED_TERMS = new Set([
  'command',
  'commands',
  'config',
  'configuration',
  'crates',
  'docs',
  'examples',
  'index',
  'main',
  'mod',
  'readme',
  'schema',
  'src',
  'test',
  'tests',
]);

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortedUnique(values) {
  return [...new Set(values)].sort(compareText);
}

function runGit(repositoryDirectory, arguments_) {
  return execFileSync(
    'git',
    ['-C', repositoryDirectory, ...arguments_],
    {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

function allPaths(files) {
  return sortedUnique(files.flatMap((file) => [
    file.path,
    ...(file.oldPath ? [file.oldPath] : []),
  ]));
}

function matchingPaths(paths, expression) {
  return paths.filter((filePath) => expression.test(filePath));
}

function extractChangedLines(diff) {
  const added = [];
  const removed = [];

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith('+++') || line.startsWith('---')) {
      continue;
    }
    if (line.startsWith('+')) {
      added.push(line.slice(1));
    } else if (line.startsWith('-')) {
      removed.push(line.slice(1));
    }
  }

  return {added, removed};
}

function flagsFromLines(lines) {
  return sortedUnique(lines.flatMap((line) => line.match(FLAG) ?? []));
}

function commandFromPath(filePath) {
  const segments = filePath.split('/');
  const cliIndex = segments.findIndex((segment) =>
    /^(cli|commands?)$/i.test(segment),
  );
  if (cliIndex === -1) {
    return null;
  }

  const rawCandidate = segments[cliIndex + 1] ?? segments.at(-1);
  const candidate = rawCandidate.replace(/\.[^.]+$/, '').toLowerCase();
  return /^(cli|command|commands|index|lib|main|mod)$/.test(candidate)
    ? null
    : candidate;
}

function documentationTerms({files, commands, addedFlags, removedFlags}) {
  const pathTerms = files.flatMap((filePath) =>
    filePath
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length >= 3 && !IGNORED_TERMS.has(term)),
  );
  const flagTerms = [...addedFlags, ...removedFlags]
    .map((flag) => flag.slice(2));
  return sortedUnique([...pathTerms, ...commands, ...flagTerms]);
}

function classifyImpact({inventory, signals, files, commits}) {
  const internalOnly = files.length > 0 && files.every((filePath) =>
    TEST_PATH.test(filePath) ||
    CI_PATH.test(filePath) ||
    DEPENDENCY_PATH.test(filePath) ||
    BUILD_RELEASE_PATH.test(filePath),
  );
  const domains = [
    inventory.cliFiles.length > 0 ||
      signals.addedFlags.length > 0 ||
      signals.removedFlags.length > 0
      ? 'cli'
      : null,
    inventory.configurationFiles.length > 0 ? 'configuration' : null,
    inventory.schemaFiles.length > 0 ? 'schema' : null,
    inventory.upstreamDocumentationFiles.length > 0
      ? 'documentation'
      : null,
  ].filter(Boolean);
  const userFacingFiles = sortedUnique([
    ...inventory.cliFiles,
    ...inventory.configurationFiles,
    ...inventory.schemaFiles,
    ...inventory.upstreamDocumentationFiles,
  ]);
  const deletedOrRenamedUserSurface = files.some((filePath) => {
    const evidenceFile = commits.filesByPath.get(filePath);
    return userFacingFiles.includes(filePath) &&
      ['deleted', 'renamed', 'type-changed'].includes(evidenceFile?.status);
  });
  const possibleBreakingChange =
    signals.removedFlags.length > 0 ||
    deletedOrRenamedUserSurface ||
    commits.subjects.some((subject) => BREAKING_SUBJECT.test(subject));

  if (internalOnly) {
    return {
      level: DOCUMENTATION_IMPACT.INTERNAL_ONLY,
      requiresUserDocumentation: false,
      reasons: ['All changed files are tests, CI, build, release, or dependency files.'],
      domains,
      possibleBreakingChange,
    };
  }
  if (domains.length === 0) {
    return {
      level: DOCUMENTATION_IMPACT.RELEASE_NOTE_ONLY,
      requiresUserDocumentation: false,
      reasons: ['No deterministic CLI, configuration, schema, or documentation signal was found.'],
      domains,
      possibleBreakingChange,
    };
  }

  const complex =
    possibleBreakingChange || domains.length > 1 || userFacingFiles.length > 10;
  return {
    level: complex
      ? DOCUMENTATION_IMPACT.COMPLEX_USER_FACING
      : DOCUMENTATION_IMPACT.SMALL_USER_FACING,
    requiresUserDocumentation: true,
    reasons: complex
      ? ['Multiple, breaking, or broad user-facing change signals require wider review.']
      : ['A localized user-facing change signal requires a focused documentation update.'],
    domains,
    possibleBreakingChange,
  };
}

function preworkPayload(prework) {
  const {sha256: _sha256, ...payload} = prework;
  return payload;
}

export function calculateReleasePreworkSha256(prework) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(preworkPayload(prework)))
    .digest('hex');
}

export function createReleasePrework({
  evidence,
  diff,
  documentationEntries = [],
}) {
  verifyReleaseEvidenceIntegrity(evidence);
  const paths = allPaths(evidence.files);
  const changedLines = extractChangedLines(diff);
  const addedFlags = flagsFromLines(changedLines.added);
  const removedFlags = flagsFromLines(changedLines.removed);
  const changedCommands = sortedUnique(
    paths.map(commandFromPath).filter(Boolean),
  );
  const removedCommands = sortedUnique(
    evidence.files
      .filter(({status}) => status === 'deleted')
      .map(({path: filePath}) => commandFromPath(filePath))
      .filter(Boolean),
  );
  const inventory = {
    sourceFiles: paths.filter((filePath) =>
      !TEST_PATH.test(filePath) &&
      !CI_PATH.test(filePath) &&
      !DOCUMENTATION_PATH.test(filePath) &&
      !DEPENDENCY_PATH.test(filePath) &&
      !BUILD_RELEASE_PATH.test(filePath),
    ),
    testFiles: matchingPaths(paths, TEST_PATH),
    ciFiles: matchingPaths(paths, CI_PATH),
    upstreamDocumentationFiles: matchingPaths(paths, DOCUMENTATION_PATH),
    cliFiles: matchingPaths(paths, CLI_PATH),
    configurationFiles: matchingPaths(paths, CONFIG_PATH),
    schemaFiles: matchingPaths(paths, SCHEMA_PATH),
    dependencyFiles: matchingPaths(paths, DEPENDENCY_PATH),
    buildAndReleaseFiles: matchingPaths(paths, BUILD_RELEASE_PATH),
  };
  const signals = {
    changedCommands,
    removedCommands,
    addedFlags,
    removedFlags,
    defaultLineChanges: {
      added: changedLines.added.filter((line) => /default/i.test(line)).length,
      removed: changedLines.removed.filter((line) => /default/i.test(line)).length,
    },
  };
  const terms = documentationTerms({
    files: sortedUnique([
      ...inventory.cliFiles,
      ...inventory.configurationFiles,
      ...inventory.schemaFiles,
      ...inventory.upstreamDocumentationFiles,
    ]),
    commands: changedCommands,
    addedFlags,
    removedFlags,
  });
  const likelyDocumentation = documentationEntries
    .map(({filePath, content}) => ({
      path: filePath,
      matchedTerms: terms.filter((term) =>
        content.toLowerCase().includes(term),
      ),
    }))
    .filter(({matchedTerms}) => matchedTerms.length > 0)
    .sort((left, right) =>
      right.matchedTerms.length - left.matchedTerms.length ||
      compareText(left.path, right.path),
    )
    .slice(0, 10);
  const commitContext = {
    subjects: evidence.commits.map(({subject}) => subject),
    filesByPath: new Map(
      evidence.files.flatMap((file) => [
        [file.path, file],
        ...(file.oldPath ? [[file.oldPath, file]] : []),
      ]),
    ),
  };
  const classification = classifyImpact({
    inventory,
    signals,
    files: paths,
    commits: commitContext,
  });
  const riskIndicators = sortedUnique([
    ...(inventory.cliFiles.length > 0 ? ['cli-contract-change'] : []),
    ...(inventory.configurationFiles.length > 0
      ? ['configuration-change']
      : []),
    ...(inventory.schemaFiles.length > 0 ? ['schema-change'] : []),
    ...(signals.removedFlags.length > 0 ? ['removed-cli-flag'] : []),
    ...(evidence.files.some(({status}) => status === 'deleted')
      ? ['file-removal']
      : []),
    ...(evidence.files.some(({status}) => status === 'renamed')
      ? ['file-rename']
      : []),
    ...(evidence.files.length > 50 ? ['large-change-set'] : []),
    ...(classification.possibleBreakingChange
      ? ['possible-breaking-change']
      : []),
  ]);

  const payload = {
    schemaVersion: RELEASE_PREWORK_SCHEMA_VERSION,
    release: {...evidence.to},
    previous: {...evidence.from},
    evidenceSha256: evidence.sha256,
    inventory,
    signals,
    likelyDocumentation,
    riskIndicators,
    classification,
  };
  return {
    ...payload,
    sha256: calculateReleasePreworkSha256(payload),
  };
}

async function readDocumentationEntries(directory) {
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const results = [];

  for (const entry of entries.sort((left, right) =>
    compareText(left.name, right.name),
  )) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...await readDocumentationEntries(entryPath));
    } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
      results.push({
        filePath: path.relative(process.cwd(), entryPath),
        content: await fs.readFile(entryPath, 'utf8'),
      });
    }
  }

  return results;
}

export async function buildReleasePrework({
  repositoryDirectory,
  evidence,
  documentationDirectory,
}) {
  const diff = runGit(repositoryDirectory, [
    'diff',
    '--unified=0',
    '--no-ext-diff',
    evidence.from.sha,
    evidence.to.sha,
    '--',
  ]);
  const documentationEntries = await readDocumentationEntries(
    documentationDirectory,
  );
  return createReleasePrework({evidence, diff, documentationEntries});
}

export function verifyReleasePreworkIntegrity(prework) {
  if (prework.schemaVersion !== RELEASE_PREWORK_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported release prework schema: ${prework.schemaVersion}`,
    );
  }
  if (prework.sha256 !== calculateReleasePreworkSha256(prework)) {
    throw new Error('Release prework checksum does not match its contents');
  }
  return prework;
}

export async function writeReleasePrework(outputDirectory, prework) {
  verifyReleasePreworkIntegrity(prework);
  const outputPath = path.join(outputDirectory, `${prework.release.tag}.json`);
  await fs.mkdir(outputDirectory, {recursive: true});
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(prework, null, 2)}\n`,
    'utf8',
  );
  return outputPath;
}
