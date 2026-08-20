import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './StartLearning.module.css';

export default function StartLearning(): ReactNode {
  return (
    <section className={styles.learning}>
      <div className={`${sharedStyles.contentWidth} ${styles.learningInner}`}>
        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>Start learning</p>
          <h2 className={sharedStyles.sectionHeading}>
            Choose the path that matches what you need.
          </h2>
        </div>

        <div className={styles.learningGrid}>
          <Link
            className={styles.learningCard}
            to="/docs/getting-started/quick-start">
            <span className={styles.cardNumber}>01</span>
            <h3>Getting Started</h3>
            <p>
              Prepare CRADLE and work through your first documented scenario.
            </p>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link
            className={styles.learningCard}
            to="/docs/user-guide/write-scenario">
            <span className={styles.cardNumber}>02</span>
            <h3>User Guide</h3>
            <p>
              Learn how to author, generate, deploy and inspect complete
              scenarios.
            </p>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link className={styles.learningCard} to="/docs/il-language/">
            <span className={styles.cardNumber}>03</span>
            <h3>Language</h3>
            <p>
              Understand CRADLE syntax, language concepts and documented
              examples.
            </p>
            <span className={styles.cardArrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}