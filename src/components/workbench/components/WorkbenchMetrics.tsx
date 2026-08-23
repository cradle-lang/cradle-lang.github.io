import type {
  ParsedCradle,
} from '../types/workbench';

type Props = {
  parsed: ParsedCradle | null;
};

export default function WorkbenchMetrics({
  parsed,
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
    [
      'Warnings',
      parsed?.warnings.length ?? 0,
    ],
  ];

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
    </>
  );
}