import React, { useEffect, useRef, useState } from 'react';

import terminalData from '../../../data/homepage-terminal.json';
import styles from './TerminalAnimation.module.css';

type TerminalTranscript = {
  tag: string;
  command: string;
  ariaLabel: string;
  output: string[];
};

const VERSION_STORAGE_KEY = 'cradle-docs-version';
const VERSION_CHANGE_EVENT = 'cradle-docs-version-change';
const CURRENT_TRANSCRIPT = terminalData.current as TerminalTranscript;
const VERSION_TRANSCRIPTS =
  terminalData.versions as Record<string, TerminalTranscript>;

const TYPE_SPEED = 45;
const COMMAND_PAUSE = 500;
const OUTPUT_LINE_SPEED = 90;
const LOOP_PAUSE = 5000;

function outputClassName(line: string): string {
  if (line.startsWith('CRADLE ')) {
    return styles.outputBanner;
  }

  if (
    line.startsWith('Dependency ') ||
    line === 'Configuration:'
  ) {
    return styles.outputHeading;
  }

  if (line.includes('✓ OK') || line.startsWith('✓ ')) {
    return styles.outputSuccess;
  }

  return styles.outputLine;
}

export default function TerminalAnimation() {
  const [transcript, setTranscript] =
    useState<TerminalTranscript>(CURRENT_TRANSCRIPT);
  const [charIndex, setCharIndex] = useState(0);
  const [visibleOutputLines, setVisibleOutputLines] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const { ariaLabel, command, output } = transcript;

  useEffect(() => {
    const selectTranscript = (version: string | null) => {
      const selected =
        version && version !== 'current'
          ? VERSION_TRANSCRIPTS[version]
          : undefined;

      setTranscript(selected ?? CURRENT_TRANSCRIPT);
    };

    const handleVersionChange = (event: Event) => {
      const version = (event as CustomEvent<{version: string}>).detail.version;
      selectTranscript(version);
    };

    selectTranscript(localStorage.getItem(VERSION_STORAGE_KEY));
    window.addEventListener(VERSION_CHANGE_EVENT, handleVersionChange);

    return () => {
      window.removeEventListener(VERSION_CHANGE_EVENT, handleVersionChange);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);

      if (mediaQuery.matches) {
        setCharIndex(command.length);
        setVisibleOutputLines(output.length);
      }
    };

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, [command.length, output.length]);

  useEffect(() => {
    setCharIndex(reducedMotion ? command.length : 0);
    setVisibleOutputLines(reducedMotion ? output.length : 0);
  }, [command, output, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    if (charIndex < command.length) {
      const timeout = window.setTimeout(
        () => setCharIndex((previous) => previous + 1),
        TYPE_SPEED,
      );

      return () => window.clearTimeout(timeout);
    }

    if (visibleOutputLines < output.length) {
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
  }, [charIndex, command.length, output.length, reducedMotion, visibleOutputLines]);

  useEffect(() => {
    const terminalBody = terminalBodyRef.current;

    if (terminalBody && visibleOutputLines > 0) {
      terminalBody.scrollTo({
        top: terminalBody.scrollHeight,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [reducedMotion, visibleOutputLines]);

  const commandIsComplete = charIndex === command.length;
  const animationIsComplete = visibleOutputLines === output.length;

  return (
    <div
      className={styles.terminalContainer}
      aria-label={ariaLabel}
    >
      <span className={styles.screenReaderOnly}>
        {`$ ${command}\n${output.join('\n')}`}
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
            {command.slice(0, charIndex)}
          </span>

          {!commandIsComplete && <span className={styles.cursor} />}
        </p>

        {output.slice(0, visibleOutputLines).map((outputLine, index) => (
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
