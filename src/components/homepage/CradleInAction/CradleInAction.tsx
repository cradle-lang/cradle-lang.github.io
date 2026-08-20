import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './CradleInAction.module.css';

export default function CradleInAction(): ReactNode {
  return (
    <section className={styles.action}>
      <div className={`${sharedStyles.contentWidth} ${styles.actionInner}`}>
        <div className={styles.actionHeader}>
          <p className={sharedStyles.sectionLabel}>CRADLE in action</p>
          <h2 className={sharedStyles.sectionHeading}>
            From scenario definition to environment.
          </h2>
          <p className={sharedStyles.sectionDescription}>
            Define the environment once, generate the required deployment
            material and move through a consistent workflow.
          </p>
        </div>

        <div className={styles.actionDemo}>
          <div className={styles.demoPanel}>
            <div className={styles.demoHeader}>
              <span>scenario.cradle</span>
            </div>

            <pre className={styles.demoCode}>
              <code>{`metadata() >
    name("HelloWorld-Win"),
    eventType("sequence"),
    object("HelloWorld").

instances() >
    instance("win7"),
    instance("router").

network("lan_0") >
    subnet("192.168.56.0/24"),
    endpoint("win7", "192.168.56.121"),
    endpoint("router", "192.168.56.122").`}</code>
            </pre>
          </div>

          <div className={styles.transform}>
            <span>Define</span>
            <div className={styles.transformLine} />
            <span>Generate</span>
            <div className={styles.transformLine} />
            <span>Deploy</span>
          </div>

          <div className={styles.environmentPanel}>
            <div className={styles.environmentTitle}>Generated Environment</div>

            <div className={styles.topology}>
              <div className={styles.topologyNode}>
                <strong>win7</strong>
                <span>192.168.56.121</span>
              </div>

              <div className={styles.networkLine} />

              <div className={styles.topologyNode}>
                <strong>router</strong>
                <span>192.168.56.122</span>
              </div>
            </div>

            <div className={styles.subnet}>192.168.56.0/24</div>
          </div>
        </div>

        <Link
          className={styles.textLink}
          to="/docs/user-guide/write-scenario">
          Learn how scenarios are written →
        </Link>
      </div>
    </section>
  );
}