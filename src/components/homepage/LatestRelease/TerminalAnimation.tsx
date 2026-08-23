import React, { useEffect, useState } from 'react';

import styles from './TerminalAnimation.module.css';

type TerminalStep = {
  command: string;
  output?: string[];
};

const TERMINAL_STEPS: TerminalStep[] = [
  {
    command: 'source venv/bin/activate',
  },
  {
    command: "sed -n '1,220p' files/input/HelloWorld.cradle",
  },
  {
    command: './cradle.sh HelloWorld libvirt',
    output: [
      'Generating HelloWorld...',
      'Deployment files generated.',
    ],
  },
  {
    command: 'ls files/output/HelloWorld.yml',
    output: ['files/output/HelloWorld.yml'],
  },
];

const TYPE_SPEED = 30;
const COMMAND_PAUSE = 420;
const OUTPUT_PAUSE = 650;
const LOOP_PAUSE = 3600;

export default function TerminalAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCurrentOutput, setShowCurrentOutput] = useState(false);

  const currentStep = TERMINAL_STEPS[stepIndex];

  useEffect(() => {
    if (!currentStep) {
      const timeout = window.setTimeout(() => {
        setStepIndex(0);
        setCharIndex(0);
        setCurrentText('');
        setCompletedSteps([]);
        setShowCurrentOutput(false);
      }, LOOP_PAUSE);

      return () => window.clearTimeout(timeout);
    }

    if (charIndex < currentStep.command.length) {
      const timeout = window.setTimeout(() => {
        setCurrentText(
          (previous) =>
            previous + currentStep.command.charAt(charIndex),
        );

        setCharIndex((previous) => previous + 1);
      }, TYPE_SPEED);

      return () => window.clearTimeout(timeout);
    }

    if (
      currentStep.output &&
      currentStep.output.length > 0 &&
      !showCurrentOutput
    ) {
      const timeout = window.setTimeout(() => {
        setShowCurrentOutput(true);
      }, COMMAND_PAUSE);

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(
      () => {
        setCompletedSteps((previous) => [
          ...previous,
          stepIndex,
        ]);

        setStepIndex((previous) => previous + 1);
        setCharIndex(0);
        setCurrentText('');
        setShowCurrentOutput(false);
      },
      showCurrentOutput ? OUTPUT_PAUSE : COMMAND_PAUSE,
    );

    return () => window.clearTimeout(timeout);
  }, [
    charIndex,
    currentStep,
    showCurrentOutput,
    stepIndex,
  ]);

  return (
    <div
      className={styles.terminalContainer}
      aria-label="CRADLE Quick Start terminal example"
    >
      <div className={styles.terminalHeader}>
        <div
          className={styles.windowControls}
          aria-hidden="true"
        >
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
        </div>

        <span className={styles.terminalTitle}>
          bash — HelloWorld
        </span>
      </div>

      <div className={styles.terminalBody}>
        {completedSteps.map((index) => {
          const step = TERMINAL_STEPS[index];

          return (
            <div
              key={`${index}-${step.command}`}
              className={styles.commandBlock}
            >
              <p className={styles.line}>
                <span
                  className={styles.prompt}
                  aria-hidden="true"
                >
                  $
                </span>

                <span className={styles.cmdText}>
                  {step.command}
                </span>
              </p>

              {step.output?.map((outputLine) => (
                <p
                  key={outputLine}
                  className={styles.outputLine}
                >
                  {outputLine}
                </p>
              ))}
            </div>
          );
        })}

        {currentStep && (
          <div className={styles.commandBlock}>
            <p className={styles.line}>
              <span
                className={styles.prompt}
                aria-hidden="true"
              >
                $
              </span>

              <span className={styles.cmdText}>
                {currentText}
              </span>

              <span
                className={styles.cursor}
                aria-hidden="true"
              />
            </p>

            {showCurrentOutput &&
              currentStep.output?.map((outputLine) => (
                <p
                  key={outputLine}
                  className={styles.outputLine}
                >
                  {outputLine}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}