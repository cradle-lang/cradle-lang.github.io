import type {
  ParsedCradle,
} from '../types/workbench';

import styles from '../Workbench.module.css';

type Props = {
  parsed: ParsedCradle | null;
  errorCount: number;
  onShowIssues: () => void;
};

export default function WorkbenchMetrics({
  parsed,
  errorCount,
  onShowIssues,
}: Props) {
  const metrics = [
    [
      'Instances',
      parsed?.instances.length ?? 0,
    ],
    [
      'Networks',
      parsed?.networks.length ?? 0,
    ],
    [
      'Objects',
      parsed?.objects.length ?? 0,
    ],
    [
      'Events',
      parsed?.events.length ?? 0,
    ],
    [
      'Links',
      parsed?.links.length ?? 0,
    ],
  ];

  const issueCount =
    (parsed?.warnings.length ?? 0) +
    errorCount;

  return (
    <>
      {metrics.map(
        ([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ),
      )}

      <button
        type="button"
        className={
          styles.metricButton
        }
        data-has-issues={
          issueCount > 0
        }
        data-issue-level={
          errorCount
            ? 'error'
            : issueCount
              ? 'warning'
              : 'none'
        }
        disabled={issueCount === 0}
        onClick={onShowIssues}
        aria-label={
          issueCount
            ? `Show ${issueCount} issue${issueCount === 1 ? '' : 's'} in the console`
            : 'No issues'
        }
      >
        <strong>{issueCount}</strong>
        <span>Issues</span>
      </button>
    </>
  );
}
