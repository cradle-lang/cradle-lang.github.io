import type {ReactNode} from 'react';

import sharedStyles from '../Homepage.module.css';
import styles from './WhyCradle.module.css';

export default function WhyCradle(): ReactNode {
  return (
    <section className={`${sharedStyles.contentWidth} ${styles.why}`}>
      <div className={sharedStyles.sectionHeader}>
        <p className={sharedStyles.sectionLabel}>Why CRADLE?</p>

        <h2 className={sharedStyles.sectionHeading}>
          Bring your cyber-range environment into one structured description.
        </h2>

        <p className={sharedStyles.sectionDescription}>
          CRADLE brings systems, networks, artifacts and event sequences into
          one structured scenario definition. Instead of spreading environment
          intent across configuration files, scripts, infrastructure settings
          and individual knowledge, teams can describe what a cyber environment
          should contain and how its events should progress in one place. The
          resulting static description can be reviewed, maintained and
          transformed for supported deployment environments.
        </p>
        <p className={styles.conceptNote}>
          CRADLE follows a Cyber Experimentation As Code (CEaC) approach, representing
          computing components and scenario intent as code rather than as disconnected
          setup instructions.
        </p>

      </div>

      <div className={styles.principles}>
        <article className={styles.principle}>
          <span className={styles.number}>01</span>
          <h3>Declarative</h3>
          <p>
            Describe the intended systems, networks, artifacts and event
            timeline without tying the scenario to the implementation details
            of one deployment platform.
          </p>
        </article>

        <article className={styles.principle}>
          <span className={styles.number}>02</span>
          <h3>Reproducible</h3>
          <p>
            Keep the environment and event sequence in a structured source
            description that can be transformed again for supported deployment
            targets.
          </p>
        </article>

        <article className={styles.principle}>
          <span className={styles.number}>03</span>
          <h3>Debuggable</h3>
          <p>
            Make environment intent inspectable so teams can review changes,
            understand scenario structure and diagnose issues more easily.
          </p>
        </article>
      </div>
    </section>
  );
}