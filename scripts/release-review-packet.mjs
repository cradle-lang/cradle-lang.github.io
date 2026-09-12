import {verifyReleaseEvidenceIntegrity} from './release-evidence.mjs';
import {renderMarkdownTemplate} from './release-markdown-template.mjs';
import {verifyReleasePreworkIntegrity} from './release-prework.mjs';

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function code(value) {
  return `\`${String(value).replaceAll('`', '\\`')}\``;
}

function bulletList(values, fallback) {
  const items = uniqueSorted(values);
  return items.length > 0
    ? items.map((value) => `- ${value}`).join('\n')
    : `- ${fallback}`;
}

function outcome(value) {
  return code(value || 'not run');
}

function regressionRows(results) {
  const rows = [
    ['Regression contracts', results.contractsFirst, results.contractsSecond],
    ['Markdown/MDX and build', results.validationFirst, results.validationSecond],
    ['Generated-site links', results.linksFirst, results.linksSecond],
  ];
  return rows
    .map(([control, first, second]) =>
      `| ${control} | ${outcome(first)} | ${outcome(second)} |`)
    .join('\n');
}

function humanVerification(prework) {
  const checks = [];
  const domains = prework.classification.domains;
  if (domains.includes('cli')) {
    checks.push('Confirm changed commands, flags, defaults, and examples against the tagged CLI.');
  }
  if (domains.includes('configuration')) {
    checks.push('Confirm configuration names, paths, defaults, and migration guidance.');
  }
  if (domains.includes('schema')) {
    checks.push('Confirm schema changes and compatibility implications for existing users.');
  }
  if (prework.classification.possibleBreakingChange) {
    checks.push('Confirm that every breaking, removed, renamed, or deprecated behavior is clearly explained.');
  }
  if (checks.length === 0) {
    checks.push('Confirm that the release note accurately summarizes the verified source delta.');
  }
  checks.push('Review technical wording, rendered pages, navigation, and version selection before merging.');
  return checks;
}

function validationSummary(results) {
  const firstPassed = [
    results.contractsFirst,
    results.validationFirst,
    results.linksFirst,
  ].every((value) => value === 'success');
  const secondPassed = [
    results.contractsSecond,
    results.validationSecond,
    results.linksSecond,
  ].every((value) => value === 'success');

  if (firstPassed) {
    return {
      passed: true,
      notice: 'All automated checks passed on the first attempt.',
    };
  }
  if (secondPassed) {
    return {
      passed: true,
      notice: 'All automated checks passed after one targeted repair and complete revalidation.',
    };
  }
  return {
    passed: false,
    notice: '> [!WARNING]\n> Automated validation is still failing. This draft must not be merged until the failed controls are corrected and rerun.',
  };
}

export function createReleaseReviewPacket({
  template,
  tag,
  expectedSha,
  historicalTest,
  archivedVersion,
  evidence,
  prework,
  changedPaths,
  routing,
  results,
  evidenceRebuilt,
  doctor,
  context,
}) {
  verifyReleaseEvidenceIntegrity(evidence);
  verifyReleasePreworkIntegrity(prework);
  if (evidence.to.tag !== tag || prework.release.tag !== tag) {
    throw new Error('Review packet inputs do not belong to the requested release tag.');
  }
  if (expectedSha && evidence.to.sha !== expectedSha.toLowerCase()) {
    throw new Error('Review packet evidence does not match the expected release SHA.');
  }
  if (routing?.release !== tag || !Array.isArray(routing?.lanes) ||
      !Array.isArray(routing?.reviewers)) {
    throw new Error('Review routing does not belong to the requested release tag.');
  }

  const validation = validationSummary(results);
  const isDraft = historicalTest || !validation.passed;
  const repairRan = Boolean(results.repair && results.repair !== 'skipped');
  const aiCalls = 1 + (repairRan ? 1 : 0);
  const titlePrefix = historicalTest
    ? '[TEST ONLY] '
    : validation.passed ? '' : '[Validation failing] ';
  const testNotice = historicalTest
    ? '> [!CAUTION]\n> Historical test output must never be merged or published.'
    : '';
  const archiveSummary = archivedVersion === 'none'
    ? 'No previous documentation snapshot was created.'
    : `Archived current documentation as version ${code(archivedVersion)}.`;
  const likelyDocumentation = prework.likelyDocumentation.map(({path, matchedTerms}) =>
    `${code(path)} — matched ${matchedTerms.map(code).join(', ')}`,
  );
  const affectedComponents = prework.classification.domains.map(code);
  const sourceAreas = evidence.sourceAreas.map(code);
  const riskIndicators = prework.riskIndicators.map(code);
  const generatedFiles = changedPaths.map(code);
  const repairs = [
    `Evidence reconstruction required: ${code(evidenceRebuilt)}.`,
    'Deterministic Markdown formatting and generated-data refresh ran before final validation.',
    repairRan
      ? `One targeted Copilot repair ran with outcome ${outcome(results.repair)}.`
      : 'No targeted Copilot repair was required.',
  ];
  const manualChecks = humanVerification(prework);
  const reviewerStatus = historicalTest
    ? 'Requested reviewers: suppressed for historical-test mode.'
    : !validation.passed
      ? 'Requested reviewers: deferred until the validation-failing draft is ready.'
      : routing.reviewers.length > 0
        ? `Requested reviewers: ${routing.reviewers.map(code).join(', ')}.`
        : 'Requested reviewers: none configured; use the review labels to assign an appropriate maintainer.';
  const homepageChanged = changedPaths.some((path) =>
    path === 'src/pages/index.tsx' ||
    path === 'src/data/homepage-terminal.json' ||
    path.startsWith('src/components/homepage/') ||
    path.startsWith('static/img/home/'),
  );

  const body = renderMarkdownTemplate(template, {
    TAG: tag,
    EXPECTED_SHA: expectedSha || evidence.to.sha,
    TEST_NOTICE: testNotice,
    VALIDATION_NOTICE: validation.notice,
    PREVIOUS_TAG: evidence.from.tag,
    PREVIOUS_SHA: evidence.from.sha,
    SOURCE_RANGE: evidence.comparison.range,
    COMMIT_COUNT: evidence.counts.commits,
    SOURCE_FILE_COUNT: evidence.counts.files,
    SOURCE_AREAS: bulletList(sourceAreas, 'No source areas were reported.'),
    AFFECTED_COMPONENTS: bulletList(
      affectedComponents,
      'No CLI, configuration, schema, or upstream-documentation domain was detected.',
    ),
    IMPACT_CLASSIFICATION: prework.classification.level,
    CLASSIFICATION_REASONS: bulletList(prework.classification.reasons, 'No reason was recorded.'),
    RISK_INDICATORS: bulletList(riskIndicators, 'No deterministic high-risk indicator was detected.'),
    LIKELY_DOCUMENTATION: bulletList(likelyDocumentation, 'No likely existing documentation page was identified.'),
    GENERATED_FILES: bulletList(generatedFiles, 'No generated content path was reported.'),
    ARCHIVE_SUMMARY: archiveSummary,
    REGRESSION_ROWS: regressionRows(results),
    AUTOMATIC_REPAIRS: bulletList(repairs, 'No automatic repair was recorded.'),
    AI_CALLS: `${aiCalls} total: 1 initial generation and ${repairRan ? '1' : '0'} targeted repair call(s).`,
    DOCTOR_SUMMARY: `Exit code ${code(doctor.exitCode)}; ${doctor.dependencyCount} dependency row(s); capture SHA-256 ${code(doctor.sha256)}.`,
    CONTEXT_SUMMARY: `${context.upstreamFiles} upstream file comparison(s), ${context.documentationFiles} documentation file(s); context SHA-256 ${code(context.sha256)}.`,
    HUMAN_VERIFICATION: bulletList(manualChecks, 'Perform technical and editorial review.'),
    REVIEW_ROUTING: [
      'Review lanes:',
      '',
      bulletList(routing.lanes, 'Documentation review'),
      '',
      reviewerStatus,
    ].join('\n'),
    USER_FACING_EVIDENCE: homepageChanged
      ? 'Pending — add desktop/mobile and light/dark screenshots after reviewing the deploy preview.'
      : 'N/A — no landing-page change was generated.',
    VERSIONING_CHECKBOX: archivedVersion === 'none'
      ? '- [ ] Documentation versioning'
      : '- [x] Documentation versioning',
    WEBSITE_CHECKBOX: homepageChanged
      ? '- [x] Website functionality'
      : '- [ ] Website functionality',
    REVIEW_NOTICE: historicalTest
      ? 'This historical-test draft must never be merged. Close it and delete its branch after inspection.'
      : validation.passed
        ? 'This PR requires human technical and editorial review before merging.'
        : 'This draft requires correction and human review before it can be marked ready.',
  }, {description: 'Release review packet template'});

  return {
    title: `${titlePrefix}Prepare documentation for CradleXC ${tag}`,
    body,
    isDraft,
    aiCalls,
  };
}
