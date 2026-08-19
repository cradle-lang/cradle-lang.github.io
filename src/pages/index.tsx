import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function Hero(): ReactNode {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
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

function WhyCradle(): ReactNode {
  return (
    <section className={styles.why}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionLabel}>Why CRADLE?</p>

        <h2> Bring your cyber-range environment into one structured description.</h2>

        <p>
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

function CradleInAction(): ReactNode {
  return (
    <section className={styles.action}>
      <div className={styles.actionInner}>
        <div className={styles.actionHeader}>
          <p className={styles.sectionLabel}>CRADLE in action</p>
          <h2>From scenario definition to environment.</h2>
          <p>
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

function StartLearning(): ReactNode {
  return (
    <section className={styles.learning}>
      <div className={styles.learningInner}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Start learning</p>
          <h2>Choose the path that matches what you need.</h2>
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

function SupportedWorkflow(): ReactNode {
  return (
    <section className={styles.supported}>
      <div className={styles.supportedInner}>
        <div>
          <p className={styles.sectionLabel}>Supported workflow</p>

          <h2>Generate for documented deployment targets.</h2>

          <p>
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

function Acknowledgements(): ReactNode {
  return (
    <section className={styles.acknowledgements}>
      <div className={styles.acknowledgementsInner}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Acknowledgements</p>

          <h2>Built through collaboration.</h2>

          <p>
            CRADLE is developed with contributions from project leads,
            collaborators and supporting organisations.
          </p>
        </div>

        <div className={styles.leadSection}>
          <p className={styles.acknowledgementLabel}>Project Leads</p>

          <div className={styles.leadGrid}>
            <div className={styles.leadCard}>
              <img
                src="/img/collaborators/liang-zhenkai.jpg"
                alt="Associate Professor Liang Zhenkai"              
                className={styles.leadImage}
              />
              <div>
                <h3>Assoc. Prof. Liang Zhenkai</h3>
                <span>National University of Singapore</span>
              </div>

            </div>

            <div className={styles.leadCard}>
              <img
                src="/img/collaborators/anis-yusof.jpeg"
                alt="Lecturer Anis Bin Yusof"
                className={styles.leadImage}
              />


              <div>
                <h3>Dr. Anis Yusof</h3>
                <span>National University of Singapore</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.collaboratorSection}>
          <p className={styles.acknowledgementLabel}>Collaborators</p>

          <div className={styles.collaboratorGrid}>

            <article className={styles.collaboratorCard}>
              <img
                src="/img/collaborators/ncl.png"
                alt="ncl"
              />

              <h3>National Cybersecruity R&D Laboratories</h3>
            </article>

            <article className={styles.collaboratorCard}>
              <img
                src="/img/collaborators/isi.png"
                alt="USC Information Sciences Institute"
              />

              <h3>University of Southern California Information Sciences Institute</h3>
            </article>
          </div>
        </div>

        <div className={styles.specialThanks}>
          <p className={styles.acknowledgementLabel}>Special Thanks</p>

          <p>
            We also acknowledge the contributors and organisations that
            supported the development and evaluation of CRADLE.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="CRADLE"
      description="A domain-specific language and toolchain for defining and deploying reproducible cyber-range environments.">
      <main>
        <Hero />
        <WhyCradle />
        <CradleInAction />
        <StartLearning />
        <SupportedWorkflow />
        <Acknowledgements />
      </main>
    </Layout>
  );
}