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
            Start with the outcome you need.
          </h2>
        </div>

        <div className={styles.learningGrid}>
          <Link
            className={styles.learningCard}
            to="/docs/overview/what-is-cradle">
            <span className={styles.cardNumber}>01</span>
            <h3>Understand the approach</h3>
            <p>
              Learn the problem CRADLE addresses, what a scenario captures and
              where the product boundaries are.
            </p>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link
            className={styles.learningCard}
            to="/docs/getting-started/first-scenario">
            <span className={styles.cardNumber}>02</span>
            <h3>Explore a scenario</h3>
            <p>
              Follow the instances, network, object and scheduled event in the
              compact HelloWorld example.
            </p>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link
            className={styles.learningCard}
            to="docs/getting-started/first-scenario">
            <span className={styles.cardNumber}>03</span>
            <h3>Model a scenario</h3>
            <p>
              Review the metadata, objects, instances, networks and events that
              make up the human-authored language.
            </p>
            <span className={styles.cardArrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
