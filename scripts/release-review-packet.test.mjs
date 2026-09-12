import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {calculateReleaseEvidenceSha256} from './release-evidence.mjs';
import {calculateReleasePreworkSha256} from './release-prework.mjs';
import {createReleaseReviewPacket} from './release-review-packet.mjs';

const template = await fs.readFile(
  new URL('../.github/release-pull-request-template.md', import.meta.url),
  'utf8',
);
const defaultTemplate = await fs.readFile(
  new URL('../.github/pull_request_template.md', import.meta.url),
  'utf8',
);

function secondLevelHeadings(markdown) {
  return [...markdown.matchAll(/^## (.+)$/gmu)].map((match) => match[1]);
}

function fixture() {
  const evidencePayload = {
    schemaVersion: 1,
    from: {tag: 'v0.18.1', sha: '1'.repeat(40)},
    to: {tag: 'v0.19.0', sha: '2'.repeat(40)},
    comparison: {
      range: 'v0.18.1..v0.19.0',
      mergeBaseSha: '1'.repeat(40),
      fromIsAncestor: true,
    },
    counts: {commits: 3, files: 2, byStatus: {modified: 2}},
    sourceAreas: ['crates'],
    commits: [],
    files: [],
  };
  const evidence = {
    ...evidencePayload,
    sha256: calculateReleaseEvidenceSha256(evidencePayload),
  };
  const preworkPayload = {
    schemaVersion: 1,
    release: {...evidence.to},
    previous: {...evidence.from},
    evidenceSha256: evidence.sha256,
    inventory: {
      sourceFiles: [],
      testFiles: [],
      ciFiles: [],
      upstreamDocumentationFiles: [],
      cliFiles: ['crates/cradle-cli/src/commands/doctor.rs'],
      configurationFiles: ['crates/cradle-cli/src/config.rs'],
      schemaFiles: [],
      dependencyFiles: [],
      buildAndReleaseFiles: [],
    },
    signals: {
      changedCommands: ['doctor'],
      removedCommands: [],
      addedFlags: [],
      removedFlags: [],
      defaultLineChanges: {added: 1, removed: 0},
    },
    likelyDocumentation: [{
      path: 'docs/reference/configuration.md',
      matchedTerms: ['config', 'doctor'],
    }],
    riskIndicators: ['cli-contract-change', 'configuration-change'],
    classification: {
      level: 'COMPLEX_USER_FACING',
      requiresUserDocumentation: true,
      reasons: ['Multiple user-facing domains changed.'],
      domains: ['cli', 'configuration'],
      possibleBreakingChange: false,
    },
  };
  const prework = {
    ...preworkPayload,
    sha256: calculateReleasePreworkSha256(preworkPayload),
  };
  return {evidence, prework};
}

function create(overrides = {}) {
  const {evidence, prework} = fixture();
  return createReleaseReviewPacket({
    template,
    tag: 'v0.19.0',
    expectedSha: '2'.repeat(40),
    historicalTest: false,
    archivedVersion: '0.18.1',
    evidence,
    prework,
    changedPaths: [
      'docs/reference/configuration.md',
      'release-notes/v0.19.0.md',
      'src/data/homepage-terminal.json',
    ],
    routing: {
      release: 'v0.19.0',
      lanes: [
        'CLI technical review',
        'Configuration technical review',
        'Documentation review',
      ],
      reviewers: [],
    },
    results: {
      contractsFirst: 'success',
      contractsSecond: 'success',
      validationFirst: 'success',
      validationSecond: 'skipped',
      linksFirst: 'success',
      linksSecond: 'skipped',
      repair: 'skipped',
    },
    evidenceRebuilt: 'false',
    doctor: {exitCode: '0', dependencyCount: '3', sha256: 'a'.repeat(64)},
    context: {
      upstreamFiles: '2',
      documentationFiles: '4',
      sha256: 'b'.repeat(64),
    },
    ...overrides,
  });
}

test('renders a decision-ready review packet from verified inputs', () => {
  const packet = create();

  assert.equal(packet.title, 'Prepare documentation for CradleXC v0.19.0');
  assert.equal(packet.isDraft, false);
  assert.equal(packet.aiCalls, 1);
  assert.match(packet.body, /## Structured review packet/);
  assert.match(packet.body, /v0\.18\.1\.\.v0\.19\.0/);
  assert.match(packet.body, /`cli`/);
  assert.match(packet.body, /`configuration-change`/);
  assert.match(packet.body, /Confirm configuration names, paths, defaults/);
  assert.match(packet.body, /CLI technical review/);
  assert.match(packet.body, /none configured; use the review labels/);
  assert.match(packet.body, /docs\/reference\/configuration\.md/);
  assert.match(packet.body, /### Review at a glance/);
  assert.match(packet.body, /3 changed file\(s\) — expand for the complete list/);
  assert.match(packet.body, /1 documentation page\(s\) matched for focused review/);
  assert.match(packet.body, /- \[ \] Confirm configuration names, paths, defaults/);
  assert.match(packet.body, /<details>/);
  assert.match(
    packet.body,
    /\| Control \| Attempt 1 \| Attempt 2 \|\n\| --- \| --- \| --- \|\n\| Regression contracts/u,
  );
  assert.match(packet.body, /All required controls passed on attempt 1/);
  assert.doesNotMatch(packet.body, /initial failure was corrected/);
  assert.doesNotMatch(packet.body, /\{\{[A-Z0-9_]+\}\}/);
});

test('omits temporary link-check output from the changed-file review list', () => {
  const packet = create({
    changedPaths: [
      'docs/reference/configuration.md',
      'lychee/out.md',
      'release-notes/v0.19.0.md',
    ],
  });

  assert.doesNotMatch(packet.body, /lychee\/out\.md/);
  assert.match(packet.body, /2 changed file\(s\) — expand for the complete list/);
});

test('retains the default pull-request template structure and checklist tone', () => {
  const releaseHeadings = secondLevelHeadings(template)
    .filter((heading) => heading !== 'Structured review packet');
  assert.deepEqual(releaseHeadings, secondLevelHeadings(defaultTemplate));

  const defaultChecklist = defaultTemplate
    .split('\n')
    .filter((line) => line.startsWith('- [ ] I '));
  const releaseChecklist = template
    .split('\n')
    .filter((line) => /^- \[[ x]\] I /u.test(line))
    .map((line) => line.replace('- [x]', '- [ ]'));
  assert.deepEqual(releaseChecklist, defaultChecklist);
});

test('records a targeted repair and keeps unresolved validation in draft', () => {
  const packet = create({
    results: {
      contractsFirst: 'failure',
      contractsSecond: 'failure',
      validationFirst: 'skipped',
      validationSecond: 'skipped',
      linksFirst: 'skipped',
      linksSecond: 'skipped',
      repair: 'success',
    },
  });

  assert.equal(packet.isDraft, true);
  assert.equal(packet.aiCalls, 2);
  assert.match(packet.title, /^\[Validation failing\]/);
  assert.match(packet.body, /2 total: 1 initial generation and 1 targeted repair/);
  assert.match(packet.body, /must not be merged/);
  assert.match(packet.body, /required controls remain unsuccessful/);
  assert.match(packet.body, /reviewers: deferred until the validation-failing draft is ready/);
});

test('explains a successful bounded repair only after the second pass succeeds', () => {
  const packet = create({
    results: {
      contractsFirst: 'failure',
      contractsSecond: 'success',
      validationFirst: 'skipped',
      validationSecond: 'success',
      linksFirst: 'skipped',
      linksSecond: 'success',
      repair: 'success',
    },
  });

  assert.equal(packet.isDraft, false);
  assert.match(packet.body, /Passed after one targeted repair/);
  assert.match(packet.body, /initial failure was corrected by one bounded repair/);
  assert.doesNotMatch(packet.body, /All required controls passed on attempt 1/);
});

test('rejects evidence for a different release SHA', () => {
  assert.throws(
    () => create({expectedSha: '9'.repeat(40)}),
    /does not match the expected release SHA/,
  );
});

test('rejects a misspelled or unsupported template placeholder', () => {
  assert.throws(
    () => create({template: `${template}\n{{Human_Checks}}\n`}),
    /Unresolved template placeholders: Human_Checks/,
  );
});
