import React, { useEffect, useRef, useState } from 'react';

import styles from './TerminalAnimation.module.css';

const COMMAND = 'cxc doctor';
const OUTPUT = [
  'CRADLE v0.18.1 — dependency check',
  '',
  '## Dependency                     Status     Purpose',
  '',
  'No plugin-specific checks configured',
  '',
  '✓ All required dependencies are installed.',
  '',
  'Configuration:',
  'Config file: /home/user/.cxc/config.toml',
  'Backends: discovered from PATH and ~/.cxc/plugins/',
];

const TYPE_SPEED = 45;
const COMMAND_PAUSE = 500;
const OUTPUT_LINE_SPEED = 90;
const LOOP_PAUSE = 5000;

function outputClassName(line: string): string {
  if (line.startsWith('CRADLE ')) {
    return styles.outputBanner;
  }

  if (line.startsWith('## ') || line === 'Configuration:') {
    return styles.outputHeading;
  }

  if (line.includes('✓ OK') || line.startsWith('✓ ')) {
    return styles.outputSuccess;
  }

  return styles.outputLine;
}

export default function TerminalAnimation() {
  const [charIndex, setCharIndex] = useState(0);
  const [visibleOutputLines, setVisibleOutputLines] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);

      if (mediaQuery.matches) {
        setCharIndex(COMMAND.length);
        setVisibleOutputLines(OUTPUT.length);
      }
    };

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    if (charIndex < COMMAND.length) {
      const timeout = window.setTimeout(
        () => setCharIndex((previous) => previous + 1),
        TYPE_SPEED,
      );

      return () => window.clearTimeout(timeout);
    }

    if (visibleOutputLines < OUTPUT.length) {
      const timeout = window.setTimeout(
        () => setVisibleOutputLines((previous) => previous + 1),
        visibleOutputLines === 0 ? COMMAND_PAUSE : OUTPUT_LINE_SPEED,
      );

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setCharIndex(0);
      setVisibleOutputLines(0);
    }, LOOP_PAUSE);

    return () => window.clearTimeout(timeout);
  }, [charIndex, reducedMotion, visibleOutputLines]);

  useEffect(() => {
    const terminalBody = terminalBodyRef.current;

    if (terminalBody && visibleOutputLines > 0) {
      terminalBody.scrollTo({
        top: terminalBody.scrollHeight,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [reducedMotion, visibleOutputLines]);

  const commandIsComplete = charIndex === COMMAND.length;
  const animationIsComplete = visibleOutputLines === OUTPUT.length;

  return (
    <div
      className={styles.terminalContainer}
      aria-label="Example output from a successful CradleXC dependency check"
    >
      <span className={styles.screenReaderOnly}>
        {`$ ${COMMAND}\n${OUTPUT.join('\n')}`}
      </span>

      <div className={styles.terminalHeader} aria-hidden="true">
        <div className={styles.windowControls}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
        </div>

        <span className={styles.terminalTitle}>
          bash — CradleXC
        </span>

        <span className={styles.statusIndicator}>
          {animationIsComplete ? 'ready' : 'running'}
        </span>
      </div>

      <div
        ref={terminalBodyRef}
        className={styles.terminalBody}
        aria-hidden="true"
      >
        <p className={styles.line}>
          <span className={styles.prompt}>$</span>
          <span className={styles.cmdText}>
            {COMMAND.slice(0, charIndex)}
          </span>

          {!commandIsComplete && <span className={styles.cursor} />}
        </p>

        {OUTPUT.slice(0, visibleOutputLines).map((outputLine, index) => (
          <p
            key={`${index}-${outputLine}`}
            className={outputClassName(outputLine)}
          >
            {outputLine || '\u00a0'}
          </p>
        ))}

        {commandIsComplete && !animationIsComplete && (
          <span className={styles.outputCursor} />
        )}
      </div>
    </div>
  );
}
