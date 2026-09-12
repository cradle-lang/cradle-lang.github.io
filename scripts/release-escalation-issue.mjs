const ISSUE_MARKER_PREFIX = 'cradlexc-release-escalation';

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function failedSteps(jobs) {
  return jobs.flatMap((job) =>
    (job.steps ?? [])
      .filter((step) => step.conclusion === 'failure')
      .map((step) => ({job: job.name, step: step.name})),
  );
}

function investigationLocations(failures) {
  const text = failures.map(({job, step}) => `${job} ${step}`).join('\n');
  return unique([
    /admission|capacity|input|policy/i.test(text)
      ? '`.github/workflows/prepare-cradlexc-release.yml` — admission and input validation'
      : null,
    /checkout|tag|target|identity|provenance/i.test(text)
      ? '`scripts/release-identity.mjs` and the upstream tag/SHA in the linked run'
      : null,
    /evidence|prework/i.test(text)
      ? '`scripts/release-evidence.mjs`, `scripts/release-prework.mjs`, and their retained JSON artifacts'
      : null,
    /rust|cargo|doctor/i.test(text)
      ? '`scripts/run-release-doctor.mjs`, `scripts/release-doctor.mjs`, and the doctor diagnostic artifact'
      : null,
    /JIT|readiness|context/i.test(text)
      ? '`scripts/release-jit.mjs`, `scripts/release-ai-context.mjs`, and the latest `main` SHA'
      : null,
    /Copilot|documentation/i.test(text)
      ? '`.github/prompts/prepare-cradlexc-release.md` and the generated content diff'
      : null,
    /contract|scope|change/i.test(text)
      ? '`scripts/release-contracts.mjs` and the retained contract report'
      : null,
    /Markdown|build|validation/i.test(text)
      ? 'The retained validation log, affected Markdown/MDX files, and `npm run build` output'
      : null,
    /link|Lychee/i.test(text)
      ? 'The generated-site link-check output and the affected built page'
      : null,
    /commit|push|pull request/i.test(text)
      ? 'Repository Actions permissions, branch protection, workflow token access, and the release branch'
      : null,
    failures.length === 0
      ? 'The failed jobs and annotations in the linked workflow run'
      : null,
  ]);
}

function categoryFromFailures(failures, exception) {
  if (exception?.category) return exception.category;
  const text = failures.map(({job, step}) => `${job} ${step}`).join('\n');
  if (/identity|SHA|tag|ancestry|policy|scope|permission/i.test(text)) {
    return 'INTEGRITY_GOVERNANCE';
  }
  if (/checkout|install|network|link|push|upload|download/i.test(text)) {
    return 'TRANSIENT_INFRASTRUCTURE';
  }
  if (/format|metadata|archive|evidence|prework|build/i.test(text)) {
    return 'DETERMINISTIC_RECOVERABLE';
  }
  return 'SEMANTIC_RECOVERABLE';
}

function requiredDecision(category) {
  switch (category) {
    case 'INTEGRITY_GOVERNANCE':
      return 'Confirm the authoritative release identity or repository policy before permitting another production run.';
    case 'TRANSIENT_INFRASTRUCTURE':
      return 'Confirm that the external service, token or runner dependency is healthy, then approve a rerun.';
    case 'DETERMINISTIC_RECOVERABLE':
      return 'Determine why deterministic reconstruction or validation remained unsuccessful and correct the owning input or workflow.';
    default:
      return 'Review the generated documentation against the tagged implementation and decide the smallest technically correct change.';
  }
}

export function createEscalationIssue({
  tag,
  expectedSha,
  repository,
  workflowName,
  runId,
  runAttempt,
  runUrl,
  jobs,
  exception = null,
}) {
  const failures = failedSteps(jobs);
  const failedJobs = jobs.filter((job) => job.conclusion === 'failure');
  const category = categoryFromFailures(failures, exception);
  const locations = investigationLocations(failures);
  const marker = `<!-- ${ISSUE_MARKER_PREFIX}:${tag} -->`;
  const failureRows = failures.length > 0
    ? failures.map(({job, step}) => `| ${job} | ${step} |`).join('\n')
    : failedJobs.map((job) => `| ${job.name} | No failed step was reported by GitHub |`).join('\n');
  const recoveryAttempts = exception?.recoveryAttempts ?? [
    'The workflow completed all safe recovery steps available before the failure.',
    'No integrity or governance control was bypassed.',
  ];
  const suggestedActions = exception?.suggestedActions ?? [
    'Open the linked workflow run and inspect the first failed step and its annotations.',
    'Start with the files and evidence listed below; verify the authoritative cause before editing generated output.',
    'Rerun the production workflow only after the cause is corrected or confirmed transient.',
  ];

  const body = [
    marker,
    `# CradleXC ${tag} release documentation is blocked`,
    '',
    '## Summary',
    '',
    `The automated release-documentation workflow could not complete for \`${tag}\`. The failure remained after all safe recovery available in this run, so processing stopped without bypassing the failed control.`,
    '',
    '> [!IMPORTANT]',
    '> This issue requires maintainer review before the release is retried. Do not close it merely by rerunning an unchanged workflow.',
    '',
    '## Impact',
    '',
    exception?.impact ?? 'Release documentation could not be accepted or published automatically. Later releases remain ordered behind this release.',
    '',
    '## Failure context',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Release | \`${tag}\` |`,
    `| Expected upstream SHA | \`${expectedSha || 'not supplied'}\` |`,
    `| Category | \`${category}\` |`,
    `| Repository | \`${repository}\` |`,
    `| Workflow | ${workflowName} |`,
    `| Run | [${runId}, attempt ${runAttempt}](${runUrl}) |`,
    `| State | \`BLOCKED\` |`,
    '',
    '### Failed controls',
    '',
    '| Job | Failed step |',
    '| --- | --- |',
    failureRows || '| Unknown | Inspect the linked workflow run |',
    '',
    '## Expected behavior',
    '',
    exception
      ? `The regression controls were expected to complete successfully: \`${JSON.stringify(exception.expectedState)}\`.`
      : 'The verified release should complete preparation, validation and pull-request creation without weakening an integrity, scope or quality control.',
    '',
    '## Observed behavior',
    '',
    exception
      ? `The structured exception recorded: \`${JSON.stringify(exception.observedState)}\`.`
      : 'One or more workflow controls failed. Detailed command output and annotations remain in the linked private Actions run.',
    '',
    '## Automated recovery performed',
    '',
    ...recoveryAttempts.map((attempt) => `- ${attempt}`),
    '',
    '## Where to investigate first',
    '',
    ...locations.map((location) => `- ${location}`),
    '',
    '## Required maintainer decision',
    '',
    exception?.requiredHumanDecision ?? requiredDecision(category),
    '',
    '## Suggested actions',
    '',
    ...suggestedActions.map((action, index) => `${index + 1}. ${action}`),
    '',
    '## Evidence and diagnostics',
    '',
    `- [Workflow run and step logs](${runUrl})`,
    '- Download any retained exception, contract, validation or doctor artifacts from the workflow run before they expire.',
    '- Logs and artifacts may describe private upstream implementation details. Do not paste sensitive content into this public issue.',
    '',
    `Responsible owner: **${exception?.responsibleOwner ?? 'CradleXC release documentation maintainer'}**`,
    '',
    '_This issue is maintained automatically. A later successful production run for the same tag will close it._',
    '',
  ].join('\n');

  return {
    title: `[Release automation blocked] CradleXC ${tag}`,
    body,
    marker,
    category,
  };
}
