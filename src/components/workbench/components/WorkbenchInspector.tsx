import type {
  ParsedCradle,
  Selection,
} from '../types/workbench';

type Props = {
  parsed: ParsedCradle | null;
  selection: Selection;
};

export default function WorkbenchInspector({
  parsed,
  selection,
}: Props) {
  if (!parsed || !selection) {
    return (
      <p>
        Select a topology node,
        network or event.
      </p>
    );
  }

  let data: unknown;

  if (selection.type === 'instance') {
    data = parsed.instances.find(
      (item) =>
        item.id === selection.id,
    );
  }

  if (selection.type === 'network') {
    data = parsed.networks.find(
      (item) =>
        item.id === selection.id,
    );
  }

  if (selection.type === 'event') {
    data = parsed.events.find(
      (item) =>
        item.id === selection.id,
    );
  }

  if (selection.type === 'object') {
    data = parsed.objects.find(
      (item) =>
        item.id === selection.id,
    );
  }

  if (!data) {
    return (
      <p>
        No information available.
      </p>
    );
  }

  return (
    <div>
      <strong>
        {selection.id}
      </strong>

      <span>
        {selection.type}
      </span>

      <pre>
        {JSON.stringify(
          data,
          null,
          2,
        )}
      </pre>
    </div>
  );
}