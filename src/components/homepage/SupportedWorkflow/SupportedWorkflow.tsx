import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './SupportedWorkflow.module.css';

export default function SupportedWorkflow(): ReactNode {
  return (
    <section className={styles.supported}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.supportedInner}`}>

        <div className={styles.supportedContent}>
          <p className={sharedStyles.sectionLabel}>
            Supported workflow
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            Check the target before you begin.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            The reference implementation generates artifacts for all three
            targets. libvirt and VirtualBox have integrated local workflows;
            SPHERE operation depends on the selected research environment.
          </p>

          <Link
            className={styles.supportLink}
            to="/docs/deployment/supported-platforms">
            Compare requirements and capabilities →
          </Link>
        </div>

        <div className={styles.platforms}>
          <article className={styles.platform}>
            <div className={styles.platformHeader}>
              <h3>libvirt</h3>

              <span className={styles.supportedStatus}>
                <span className={styles.statusIcon}>✓</span>
                Integrated workflow
              </span>
            </div>

            <p>
              Local artifact generation and scenario execution.
            </p>

            <div className={styles.platformMeta}>
              Local workflow
            </div>
          </article>

          <article className={styles.platform}>
            <div className={styles.platformHeader}>
              <h3>VirtualBox</h3>

              <span className={styles.supportedStatus}>
                <span className={styles.statusIcon}>✓</span>
                Integrated workflow
              </span>
            </div>

            <p>
              Local artifact generation and scenario execution.
            </p>

            <div className={styles.platformMeta}>
              Local workflow
            </div>
          </article>

          <article className={`${styles.platform} ${styles.platformPartial}`}>
            <div className={styles.platformHeader}>
              <h3>SPHERE</h3>

              <span className={styles.partialStatus}>
                <span className={styles.statusIcon}>△</span>
                Environment-dependent
              </span>
            </div>

            <p>
              Artifact generation with project-specific operation.
            </p>

            <div className={styles.platformMeta}>
              Research environment
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}