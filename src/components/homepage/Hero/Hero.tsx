import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './Hero.module.css';
import { IsometricTopologyBackground } from './IsometricTopologyBackground';

export default function Hero(): ReactNode {
  return (
    <section className={styles.hero}>
      <div className={`${sharedStyles.contentWidth} ${styles.heroInner}`}>
        <div className={styles.heroContent}>
          <p className={sharedStyles.eyebrow}>
            Cyber Experimentation as Code
          </p>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>Define reproducible</span>{' '}
            <span className={styles.heroTitleLine}>
              cyber-range environments.
            </span>
          </h1>

          <p className={styles.heroDescription}>
            Describe systems, networks, artifacts and scenario events in one
            structured specification that can be reviewed and maintained, then
            transform it into deployment material for supported platforms.
          </p>

          <p className={styles.heroTechnical}>
            CRADLE—the Cyber-testbed Reconstruction and Automation Description
            Language—is a declarative and debuggable domain-specific language.
          </p>

          <div className={styles.heroActions}>
            <Link
              className={styles.primaryButton}
              to="/workbench/">
              Try CRADLE in the Workbench
            </Link>

            <Link
              className={styles.secondaryButton}
              to="/docs/getting-started/quick-start">
              Follow the Quick Start
            </Link>
          </div>
        </div>

        {/* Decorative topology illustration; hidden from assistive technology. */}
        <IsometricTopologyBackground />
      </div>
    </section>
  );
}
