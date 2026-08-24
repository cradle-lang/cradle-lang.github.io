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
            Choose a backend before you generate files.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            CradleXC uses external backend plugins to render target-specific
            files. Available targets and requirements are determined by the
            backend you install, rather than built into CradleXC itself.
          </p>

          <Link
            className={styles.supportLink}
            to="/docs/guides/backends/overview">
            Learn about backend plugins →
          </Link>
        </div>

        <div className={styles.platforms}>
          <article className={styles.platform}>
            <span className={styles.supportedStatus}>01 Choose</span>
            <h3>Select a backend</h3>
            <p>Find published plugins in the CRADLE release repository.</p>
          </article>
          <article className={styles.platform}>
            <span className={styles.supportedStatus}>02 Verify</span>
            <h3>Check discovery</h3>
            <p>Use <code>cxc backend list</code> to confirm it is available locally.</p>
          </article>
          <article className={styles.platform}>
            <span className={styles.partialStatus}>03 Generate</span>
            <h3>Render target files</h3>
            <p>Use <code>cxc emit</code> with the selected backend and inspect its output.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
