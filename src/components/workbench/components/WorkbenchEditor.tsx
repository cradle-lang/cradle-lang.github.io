type Props = {
  source: string;

  onChange: (
    value: string,
  ) => void;
};

export default function WorkbenchEditor({
  source,
  onChange,
}: Props) {
  return (
    <textarea
      value={source}
      spellCheck={false}
      aria-label="CRADLE source"
      onChange={(event) =>
        onChange(event.target.value)
      }
    />
  );
}