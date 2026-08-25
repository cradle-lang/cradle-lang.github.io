import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './SupportedWorkflow.module.css';

const BACKEND_REPOSITORY_URL = 'https://github.com/cradle-lang/cradle-release';

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
            Build for the environment you need.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            CradleXC keeps scenario logic independent from
             target-specific generation. Backend plugins translate 
             your CRADLE scenario into the files required by each 
             environment.
          </p>

          <Link
            className={styles.supportLink}
            to="/docs/guides/backends/overview">
            Read backend compatibility guidance →
          </Link>
        </div>

        <div className={styles.workflowGrid}>

          <article className={styles.workflowStep}>
            <span className={styles.stepLabel}>
              01 Choose
            </span>

            <h3>
              Select a backend
            </h3>

            <p>
              Browse published backend plugins and choose one for your
              target environment.
            </p>

            <a
              className={styles.repositoryLink}
              href={BACKEND_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer">
              <span>
                Backend repository
              </span>

              <span aria-hidden="true">
                ↗
              </span>
            </a>
          </article>

          <article className={styles.workflowStep}>
            <span className={styles.stepLabel}>
              02 Install
            </span>

            <h3>
              Install the backend
            </h3>

            <p>
              Install the selected backend plugin with the CradleXC CLI.
            </p>

            <code className={styles.command}>
              cxc plugin install &lt;plugin_name&gt;
            </code>

          </article>

          <article className={styles.workflowStep}>
            <span className={styles.stepLabel}>
              03 Verify
            </span>

            <h3>
              Check discovery
            </h3>

            <p>
              Use <code>cxc backend list</code> to confirm that CradleXC
              detects the installed backend.
            </p>
          </article>

          <article className={styles.workflowStep}>
            <span
              className={`${styles.stepLabel} ${styles.generateLabel}`}>
              04 Generate
            </span>

            <h3>
              Render target files
            </h3>

            <p>
              Use <code>cxc emit</code> with the selected backend to
              generate target-specific output.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
