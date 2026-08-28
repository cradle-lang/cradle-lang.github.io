import React, { useEffect, useRef, useState } from 'react';

import styles from './TerminalAnimation.module.css';

const COMMAND = 'cxc doctor';
const OUTPUT = [
  'CRADLE v0.17.0 — dependency check',
  '',
  '## Dependency                     Status     Purpose',
  '',
  'ansible-playbook               ✓ OK       infra/provisioning/event playbook execution [/usr/bin/ansible-playbook]',
  'virsh                          ✓ OK       local qemu:///system connection check [/usr/bin/virsh]',
  'vagrant                        ✓ OK       VM lifecycle management (boot/destroy VMs) [/usr/bin/vagrant]',
  'ansible-playbook               ✓ OK       provisioning + event execution [/usr/bin/ansible-playbook]',
  'ansible-galaxy                 ✓ OK       installs required ansible collections at bm_script time [/usr/bin/ansible-galaxy]',
  'VBoxManage                     ✓ OK       VirtualBox CLI (provider=virtualbox, the default) [/usr/bin/VBoxManage]',
  'virsh                          ✓ OK       libvirt management (provider=libvirt) [/usr/bin/virsh]',
  'qemu-system-x86_64             ✓ OK       QEMU/KVM hypervisor binary (provider=libvirt) [/usr/bin/qemu-system-x86_64]',
  'gcc                            ✓ OK       C compiler (artifact generation for Linux) [/usr/bin/gcc]',
  'x86_64-w64-mingw32-gcc         ✓ OK       cross-compiler (artifact generation for Windows) [/usr/bin/x86_64-w64-mingw32-gcc]',
  'bc                             ✓ OK       timing calculations [/usr/bin/bc]',
  'mrg                            ✓ OK       SPHERE experiment/realization/materialization lifecycle [/usr/local/bin/mrg]',
  '',
  '✓ All required dependencies are installed.',
  '',
  'Configuration:',
  'Config file: /home/amish/.cxc/config.toml',
  'Forensic dir:    /opt/cxc/forensic',
  'Dataset dir:     /opt/cxc/dataset',
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
