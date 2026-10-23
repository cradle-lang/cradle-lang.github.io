import type {CSSProperties} from 'react';

export default function LibraryIcon({name = 'scenarios', size = 20, style}: {name?: string; size?: number; style?: CSSProperties}) {
  const paths: Record<string, string> = {
    overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    scenarios: 'M12 2 3 7v10l9 5 9-5V7z M3 7l9 5 9-5 M12 12v10 M7.5 4.5l9 5',
    tags: 'M3 3h8l10 10-8 8L3 11z M7 7h.01',
    heuristics: 'M3 3h8l10 10-8 8L3 11z M7 7h.01',
    configurations: 'M7 3h8l4 4v14H5V3z M14 3v5h5 M9 12h6 M9 16h6',
    frameworks: 'M12 3v6 M5 15v-3h14v3 M12 9v6 M9 3h6v4H9z M2 16h6v5H2z M9 16h6v5H9z M16 16h6v5h-6z',
    search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z M16 16l5 5',
    arrow: 'M4 12h16 M14 6l6 6-6 6',
    external: 'M14 3h7v7 M21 3 11 13 M10 5H4v15h15v-6',
    monitor: 'M3 4h18v13H3z M8 21h8 M12 17v4',
    network: 'M12 3v7 M4 17v-4h16v4 M9 3h6v4H9z M1 17h6v5H1z M17 17h6v5h-6z',
    check: 'm5 12 4 4L19 6',
    close: 'm6 6 12 12 M6 18 18 6',
    back: 'M20 12H4 M10 6l-6 6 6 6',
    code: 'm8 7-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16',
    book: 'M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2z M12 5v16',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name] || paths.scenarios} /></svg>;
}
