import {useRef} from 'react';
import styles from './WorkbenchEditor.module.css';

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
  const gutter = useRef<HTMLDivElement>(null);
  return (
    <div className={styles.editor}>
      <div className={styles.gutter} ref={gutter} aria-hidden="true">
        {source.split('\n').map((_, index) => <div key={index}>{index + 1}</div>)}
      </div>
      <textarea
        value={source}
        spellCheck={false}
        wrap="off"
        onScroll={(event) => {
          if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop;
        }}
        aria-label="CRADLE source"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
