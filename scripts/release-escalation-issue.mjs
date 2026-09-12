import {renderMarkdownTemplate} from './release-markdown-template.mjs';

const ISSUE_MARKER_PREFIX = 'cradlexc-release-escalation';
const TEST_ISSUE_MARKER_PREFIX = 'cradlexc-release-test-escalation';

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

function requiredDecision(category, runKind) {
  switch (category) {
    case 'INTEGRITY_GOVERNANCE':
      return `Confirm the authoritative release identity or repository policy before permitting another ${runKind} run.`;
    case 'TRANSIENT_INFRASTRUCTURE':
      return 'Confirm that the external service, token or runner dependency is healthy, then approve a rerun.';
    case 'DETERMINISTIC_RECOVERABLE':
      return 'Determine why deterministic reconstruction or validation remained unsuccessful and correct the owning input or workflow.';
    default:
      return 'Review the generated documentation against the tagged implementation and decide the smallest technically correct change.';
  }
}

export function renderEscalationIssueTemplate(template, values) {
  return renderMarkdownTemplate(template, values, {
    description: 'Release escalation issue template',
  });
}

export function createEscalationIssue({
  template,
  tag,
  expectedSha,
  repository,
  workflowName,
  runId,
  runAttempt,
  runUrl,
  jobs,
  exception = null,
  historicalTest = false,
}) {
  const failures = failedSteps(jobs);
  const failedJobs = jobs.filter((job) => job.conclusion === 'failure');
  const category = categoryFromFailures(failures, exception);
  const locations = investigationLocations(failures);
  const markerPrefix = historicalTest
    ? TEST_ISSUE_MARKER_PREFIX
    : ISSUE_MARKER_PREFIX;
  const marker = `<!-- ${markerPrefix}:${tag} -->`;
  const runKind = historicalTest ? 'historical test' : 'production';
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
    `Rerun the ${runKind} workflow only after the cause is corrected or confirmed transient.`,
  ];

  const body = renderEscalationIssueTemplate(template, {
    MARKER: marker,
    TAG: tag,
    RUN_KIND: runKind,
    IMPACT: historicalTest
      ? `This is an explicitly requested test-only escalation and does not represent a production release block. ${exception?.impact ?? 'The historical documentation simulation could not be accepted automatically.'}`
      : exception?.impact ?? 'Release documentation could not be accepted or published automatically. Later releases remain ordered behind this release.',
    EXPECTED_SHA: expectedSha || 'not supplied',
    CATEGORY: category,
    REPOSITORY: repository,
    WORKFLOW_NAME: workflowName,
    RUN_ID: runId,
    RUN_ATTEMPT: runAttempt,
    RUN_URL: runUrl,
    FAILURE_ROWS: failureRows || '| Unknown | Inspect the linked workflow run |',
    EXPECTED_BEHAVIOR: exception
      ? `The regression controls were expected to complete successfully: \`${JSON.stringify(exception.expectedState)}\`.`
      : 'The verified release should complete preparation, validation and pull-request creation without weakening an integrity, scope or quality control.',
    OBSERVED_BEHAVIOR: exception
      ? `The structured exception recorded: \`${JSON.stringify(exception.observedState)}\`.`
      : 'One or more workflow controls failed. Detailed command output and annotations remain in the linked private Actions run.',
    RECOVERY_ATTEMPTS: recoveryAttempts.map((attempt) => `- ${attempt}`).join('\n'),
    INVESTIGATION_LOCATIONS: locations.map((location) => `- ${location}`).join('\n'),
    REQUIRED_DECISION: exception?.requiredHumanDecision ?? requiredDecision(category, runKind),
    SUGGESTED_ACTIONS: suggestedActions.map((action, index) => `${index + 1}. ${action}`).join('\n'),
    RESPONSIBLE_OWNER: exception?.responsibleOwner ?? 'CradleXC release documentation maintainer',
  });

  return {
    title: historicalTest
      ? `[Release automation test blocked] CradleXC ${tag}`
      : `[Release automation blocked] CradleXC ${tag}`,
    body,
    marker,
    category,
  };
}
