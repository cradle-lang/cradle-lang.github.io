import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './LatestRelease.module.css';
import TerminalAnimation from './TerminalAnimation';

const QUICK_START_URL = '/docs/getting-started/quick-start';
const INSTALL_URL = '/docs/getting-started/install-cradlexc';

export default function LatestRelease(): ReactNode {
  return (
    <section className={styles.releases}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.releasesInner}`}
      >
        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>
            Get CRADLE
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            Install CradleXC.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            Install CradleXC from source, verify your environment and
            start writing your first scenario.
          </p>
        </div>

        <div className={styles.releaseGrid}>

          <div className={styles.installPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>
                SOURCE · CARGO
              </span>

              <h3>
                Install from the source tree.
              </h3>

              <p className={styles.panelDescription}>
                Build the `cxc` CLI from the CradleXC Cargo workspace.
              </p>
            </div>

            <div className={styles.installSteps}>
              <div className={styles.installStep}>
                <span className={styles.stepNumber}>
                  01
                </span>

                <div>
                  <strong>
                    Check out the source
                  </strong>

                  <span>
                    Use a CradleXC source checkout.
                  </span>
                </div>
              </div>

              <div className={styles.stepConnector} />

              <div className={styles.installStep}>
                <span className={styles.stepNumber}>
                  02
                </span>

                <div>
                  <strong>
                    Install CradleXC
                  </strong>

                  <code>
                    cargo install --path crates/cradle-cli
                  </code>
                </div>
              </div>

              <div className={styles.stepConnector} />

              <div className={styles.installStep}>
                <span className={styles.stepNumber}>
                  03
                </span>

                <div>
                  <strong>
                    Update CradleXC
                  </strong>

                  <span>
                    Reinstall after pulling a new source revision.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.panelFooter}>
              <Link
                className={styles.primaryAction}
                to={INSTALL_URL}
              >
                Read the installation guide →
              </Link>

              <Link
                className={styles.textAction}
                to="/releases/"
              >
                View release notes →
              </Link>
            </div>
          </div>

          <div className={styles.quickStartPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>
                Ready to build
              </span>

              <h3>
                Check your environment.
              </h3>

              <p className={styles.panelDescription}>
                Confirm that CradleXC is available and verify the local
                dependencies required by your CRADLE environment.
              </p>
            </div>

            <div className={styles.terminalWrapper}>
              <TerminalAnimation />
            </div>

            <div className={styles.panelFooter}>
              <Link
                className={styles.primaryAction}
                to={QUICK_START_URL}
              >
                Follow the Quick Start →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
