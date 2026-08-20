import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './Hero.module.css';

export default function Hero(): ReactNode {
  return (
    <section className={styles.hero}>
      <div className={`${sharedStyles.contentWidth} ${styles.heroInner}`}>
        <div className={styles.heroContent}>
          <p className={sharedStyles.eyebrow}>
            Cyber-testbed Reconstruction and Automation Description Language
          </p>

          <h1 className={styles.heroTitle}>
            Define reproducible
            <br />
            cyber-range environments.
          </h1>

          <p className={styles.heroDescription}>
            CRADLE is a declarative and debuggable domain-specific language for
            describing cyber-testbed environments as code. It provides a high-level,
            static representation of computing infrastructure that can be reviewed,
            transformed and deployed on supported platforms.
          </p>

          <div className={styles.heroActions}>
            <Link
              className={styles.primaryButton}
              to="/docs/getting-started/quick-start">
              Get Started
            </Link>

            <Link className={styles.secondaryButton} to="/docs/">
              Read the Docs
            </Link>
          </div>
        </div>

        <div className={styles.heroExample}>
          <div className={styles.codeHeader}>
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
      </div>
    </section>
  );
}