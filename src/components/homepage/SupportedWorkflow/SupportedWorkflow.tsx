import type {ReactNode} from 'react';

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
            Generate for documented deployment targets.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            CRADLE currently documents generation for libvirt, VirtualBox and
            SPHERE, with complete local workflow coverage for libvirt and
            VirtualBox.
          </p>
        </div>

        <div className={styles.platforms}>
          <span>libvirt</span>
          <span>VirtualBox</span>
          <span>SPHERE</span>
        </div>
      </div>
    </section>
  );
}