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
            <span className={styles.supportedStatus}>✓ Integrated workflow</span>
            <h3>libvirt</h3>
            <p>Local artifact generation and scenario execution.</p>
          </article>
          <article className={styles.platform}>
            <span className={styles.supportedStatus}>✓ Integrated workflow</span>
            <h3>VirtualBox</h3>
            <p>Local artifact generation and scenario execution.</p>
          </article>
          <article className={styles.platform}>
            <span className={styles.partialStatus}>△ Environment-dependent</span>
            <h3>SPHERE</h3>
            <p>Artifact generation with project-specific operation.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
