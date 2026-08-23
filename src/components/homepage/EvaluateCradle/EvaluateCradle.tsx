import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './EvaluateCradle.module.css';

export default function EvaluateCradle(): ReactNode {
  return (
    <section className={styles.evaluate}>
      <div className={`${sharedStyles.contentWidth} ${styles.evaluateInner}`}>
        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>Evaluate CRADLE</p>
          <h2 className={sharedStyles.sectionHeading}>
            Inspect the approach, not just the claims.
          </h2>
          <p className={sharedStyles.sectionDescription}>
            Evaluate current capabilities directly through the working model,
            documented example and current schema reference.
          </p>
        </div>

        <div className={styles.evidenceGrid}>
          <Link className={styles.evidenceCard} to="/workbench/">
            <span className={styles.cardLabel}>Working model</span>
            <h3>Inspect a scenario in the browser</h3>
            <p>
              Edit CRADLE source and inspect its topology and event flow without
              deploying infrastructure.
            </p>
            <span className={styles.cardLink}>Open the Workbench →</span>
          </Link>

          <Link
            className={styles.evidenceCard}
            to="/docs/introduction/helloworld">
            <span className={styles.cardLabel}>Documented example</span>
            <h3>Follow the HelloWorld scenario</h3>
            <p>
              Trace instances, a network, an object and scheduled events
              through a compact scenario definition.
            </p>
            <span className={styles.cardLink}>Explore HelloWorld →</span>
          </Link>

          <Link
            className={styles.evidenceCard}
            to="/docs/schema/cradle-schema">
            <span className={styles.cardLabel}>Preview reference</span>
            <h3>Review the current scenario model</h3>
            <p>
              Examine the documented metadata, instances, networks and events,
              together with known schema and compiler differences.
            </p>
            <span className={styles.cardLink}>Open the schema reference →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
