import type {ReactNode} from 'react';

import sharedStyles from '../Homepage.module.css';
import styles from './WhyCradle.module.css';

export default function WhyCradle(): ReactNode {
  return (
    <section className={styles.why}>
      <div className={`${sharedStyles.contentWidth} ${styles.whyInner}`}>
      <div className={sharedStyles.sectionHeader}>
        <p className={sharedStyles.sectionLabel}>Why CRADLE?</p>

        <h2 className={sharedStyles.sectionHeading}>
          Bring scattered configuration and scenario knowledge into one
          structured specification.
        </h2>

        <p className={sharedStyles.sectionDescription}>
          Cyber environments often depend on manual configuration, scattered
          scripts, infrastructure settings and platform-specific knowledge.
          As they evolve, it becomes harder to understand what changed or
          recreate the same scenario elsewhere.
        </p>
      </div>

      <div className={styles.valueStatement}>
        <div className={styles.valueContent}>
          <p className={styles.valueLabel}>One structured description</p>

          <h3>
            Keep the environment and scenario intent together.
          </h3>

          <p>
            CRADLE represents the systems, networks, artifacts and event
            sequence of a cyber experiment in a structured scenario definition.
            That definition can be reviewed, maintained and transformed for
            supported deployment environments.
          </p>
        </div>

        <div className={styles.valueFlow} aria-label="CRADLE scenario model">
          <span>Systems</span>
          <span>Networks</span>
          <span>Artifacts</span>
          <span>Events</span>
          <strong>scenario.cradle</strong>
        </div>
      </div>

      <div className={styles.concept}>
        <p className={styles.conceptLabel}>Cyber Experimentation as Code</p>

        <p className={styles.conceptNote}>
          CRADLE describes computing components as code, providing a static,
          high-level environment description that teams can review, compare
          and maintain.
        </p>
      </div>

      <div className={styles.principles}>
        <article className={styles.principle}>
          <span className={styles.number}>01</span>
          <h3>Declarative</h3>
          <p>
            Describe the intended systems, networks, artifacts and events in a
            high-level specification instead of platform setup steps.
          </p>
        </article>

        <article className={styles.principle}>
          <span className={styles.number}>02</span>
          <h3>Repeatable</h3>
          <p>
            Preserve experiment intent as version-controlled text that can be
            compared, maintained and generated again for supported targets.
          </p>
        </article>

        <article className={styles.principle}>
          <span className={styles.number}>03</span>
          <h3>Debuggable</h3>
          <p>
            Inspect the authored scenario, intermediary representation and
            generated provider material when diagnosing a workflow.
          </p>
        </article>
      </div>
      </div>
    </section>
  );
}
