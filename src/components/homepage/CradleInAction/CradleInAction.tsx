import type {ReactNode} from 'react';
import {useState} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './CradleInAction.module.css';

type Target =
  | 'win7'
  | 'router'
  | 'lan'
  | 'subnet'
  | 'win7-endpoint'
  | 'router-endpoint'
  | null;

export default function CradleInAction(): ReactNode {
  const [selectedTarget, setSelectedTarget] =
    useState<Target>('win7');

  const [hoverTarget, setHoverTarget] =
    useState<Target>(null);

  const activeTarget = hoverTarget ?? selectedTarget;

  const isWin7Active =
    activeTarget === 'win7' ||
    activeTarget === 'win7-endpoint';

  const isRouterActive =
    activeTarget === 'router' ||
    activeTarget === 'router-endpoint';

  const isConnectionActive =
    activeTarget === 'lan' ||
    activeTarget === 'subnet' ||
    activeTarget === 'win7-endpoint' ||
    activeTarget === 'router-endpoint';

  return (
    <section
      id="how-cradle-works"
      className={styles.action}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.actionInner}`}>

        <div className={styles.actionHeader}>
          <p className={sharedStyles.sectionLabel}>
            CRADLE in action
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            From scenario definition to environment.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            Select part of the CRADLE scenario to see how its systems,
            network and endpoints map into the generated environment.
          </p>
        </div>

        <div className={styles.actionDemo}>

          <div className={styles.demoPanel}>
            <div className={styles.demoHeader}>
              <span>scenario.cradle</span>

              <span className={styles.demoHint}>
                Select a highlighted line
              </span>
            </div>

            <div className={styles.demoCode}>

              <div className={styles.codeLine}>
                <span>metadata() &gt;</span>
              </div>

              <div className={styles.codeLine}>
                <span className={styles.indent}>
                  name("HelloWorld-Win"),
                </span>
              </div>

              <div className={styles.codeLine}>
                <span className={styles.indent}>
                  eventType("sequence"),
                </span>
              </div>

              <div className={styles.codeLine}>
                <span className={styles.indent}>
                  object("HelloWorld").
                </span>
              </div>

              <div className={styles.codeSpacer} />

              <div className={styles.codeLine}>
                <span>instances() &gt;</span>
              </div>

              <button
                type="button"
                className={`${styles.codeToken} ${
                  activeTarget === 'win7'
                    ? styles.codeTokenActive
                    : ''
                }`}
                aria-pressed={selectedTarget === 'win7'}
                onMouseEnter={() => setHoverTarget('win7')}
                onMouseLeave={() => setHoverTarget(null)}
                onFocus={() => setHoverTarget('win7')}
                onBlur={() => setHoverTarget(null)}
                onClick={() => setSelectedTarget('win7')}>
                <span className={styles.indent}>
                  instance("win7"),
                </span>
              </button>

              <button
                type="button"
                className={`${styles.codeToken} ${
                  activeTarget === 'router'
                    ? styles.codeTokenActive
                    : ''
                }`}
                aria-pressed={selectedTarget === 'router'}
                onMouseEnter={() => setHoverTarget('router')}
                onMouseLeave={() => setHoverTarget(null)}
                onFocus={() => setHoverTarget('router')}
                onBlur={() => setHoverTarget(null)}
                onClick={() => setSelectedTarget('router')}>
                <span className={styles.indent}>
                  instance("router").
                </span>
              </button>

              <div className={styles.codeSpacer} />

              <button
                type="button"
                className={`${styles.codeToken} ${
                  activeTarget === 'lan'
                    ? styles.codeTokenActive
                    : ''
                }`}
                aria-pressed={selectedTarget === 'lan'}
                onMouseEnter={() => setHoverTarget('lan')}
                onMouseLeave={() => setHoverTarget(null)}
                onFocus={() => setHoverTarget('lan')}
                onBlur={() => setHoverTarget(null)}
                onClick={() => setSelectedTarget('lan')}>
                network("lan_0") &gt;
              </button>

              <button
                type="button"
                className={`${styles.codeToken} ${
                  activeTarget === 'subnet'
                    ? styles.codeTokenActive
                    : ''
                }`}
                aria-pressed={selectedTarget === 'subnet'}
                onMouseEnter={() => setHoverTarget('subnet')}
                onMouseLeave={() => setHoverTarget(null)}
                onFocus={() => setHoverTarget('subnet')}
                onBlur={() => setHoverTarget(null)}
                onClick={() => setSelectedTarget('subnet')}>
                <span className={styles.indent}>
                  subnet("192.168.56.0/24"),
                </span>
              </button>

              <button
                type="button"
                className={`${styles.codeToken} ${
                  activeTarget === 'win7-endpoint'
                    ? styles.codeTokenActive
                    : ''
                }`}
                aria-pressed={
                  selectedTarget === 'win7-endpoint'
                }
                onMouseEnter={() =>
                  setHoverTarget('win7-endpoint')
                }
                onMouseLeave={() => setHoverTarget(null)}
                onFocus={() =>
                  setHoverTarget('win7-endpoint')
                }
                onBlur={() => setHoverTarget(null)}
                onClick={() =>
                  setSelectedTarget('win7-endpoint')
                }>
                <span className={styles.indent}>
                  endpoint("win7", "192.168.56.121"),
                </span>
              </button>

              <button
                type="button"
                className={`${styles.codeToken} ${
                  activeTarget === 'router-endpoint'
                    ? styles.codeTokenActive
                    : ''
                }`}
                aria-pressed={
                  selectedTarget === 'router-endpoint'
                }
                onMouseEnter={() =>
                  setHoverTarget('router-endpoint')
                }
                onMouseLeave={() => setHoverTarget(null)}
                onFocus={() =>
                  setHoverTarget('router-endpoint')
                }
                onBlur={() => setHoverTarget(null)}
                onClick={() =>
                  setSelectedTarget('router-endpoint')
                }>
                <span className={styles.indent}>
                  endpoint("router", "192.168.56.122").
                </span>
              </button>
            </div>
          </div>

          <div
            className={styles.transform}
            aria-label="Define, generate and deploy">

            <div className={styles.transformStep}>
              <span className={styles.transformNumber}>
                01
              </span>
              <strong>Define</strong>
            </div>

            <div className={styles.transformTrack}>
              <span className={styles.transformSignal} />
            </div>

            <div className={styles.transformStep}>
              <span className={styles.transformNumber}>
                02
              </span>
              <strong>Generate</strong>
            </div>

            <div className={styles.transformTrack}>
              <span
                className={`${styles.transformSignal} ${styles.transformSignalDelayed}`}
              />
            </div>

            <div className={styles.transformStep}>
              <span className={styles.transformNumber}>
                03
              </span>
              <strong>Deploy</strong>
            </div>
          </div>

          <div className={styles.environmentPanel}>

            <div className={styles.environmentHeader}>
              <div>
                <div className={styles.environmentTitle}>
                  Generated environment
                </div>

                <div className={styles.environmentSubtitle}>
                  Interpreted from the selected scenario definition
                </div>
              </div>

              <span className={styles.environmentBadge}>
                Preview
              </span>
            </div>

            <div className={styles.topology}>

              <div
                className={`${styles.topologyNode} ${
                  isWin7Active
                    ? styles.topologyNodeActive
                    : ''
                }`}>
                <span className={styles.nodeType}>
                  Instance
                </span>

                <strong>win7</strong>

                <span className={styles.nodeAddress}>
                  192.168.56.121
                </span>
              </div>

              <div
                className={`${styles.endpointLine} ${
                  isConnectionActive
                    ? styles.endpointLineActive
                    : ''
                }`}>
                <span
                  className={`${styles.connectionLabel} ${
                    activeTarget === 'lan' ||
                    activeTarget === 'subnet'
                      ? styles.connectionLabelActive
                      : ''
                  }`}>
                  lan_0
                </span>
              </div>

              <div
                className={`${styles.topologyNode} ${
                  isRouterActive
                    ? styles.topologyNodeActive
                    : ''
                }`}>
                <span className={styles.nodeType}>
                  Instance
                </span>

                <strong>router</strong>

                <span className={styles.nodeAddress}>
                  192.168.56.122
                </span>
              </div>
            </div>

            <div
              className={`${styles.subnetSummary} ${
                activeTarget === 'lan' ||
                activeTarget === 'subnet'
                  ? styles.subnetSummaryActive
                  : ''
              }`}>
              <span>Network</span>
              <strong>lan_0</strong>
              <code>192.168.56.0/24</code>
            </div>

            <div
              className={styles.selectionInfo}
              aria-live="polite">

              {activeTarget === 'win7' && (
                <>
                  <strong>Instance</strong>

                  <span>
                    Defines the <code>win7</code> system in
                    the scenario.
                  </span>
                </>
              )}

              {activeTarget === 'router' && (
                <>
                  <strong>Instance</strong>

                  <span>
                    Defines the <code>router</code> system in
                    the scenario.
                  </span>
                </>
              )}

              {activeTarget === 'lan' && (
                <>
                  <strong>Network</strong>

                  <span>
                    Creates the <code>lan_0</code> network
                    connecting the scenario instances.
                  </span>
                </>
              )}

              {activeTarget === 'subnet' && (
                <>
                  <strong>Subnet</strong>

                  <span>
                    Assigns{' '}
                    <code>192.168.56.0/24</code> to the{' '}
                    <code>lan_0</code> network.
                  </span>
                </>
              )}

              {activeTarget === 'win7-endpoint' && (
                <>
                  <strong>Endpoint</strong>

                  <span>
                    Places <code>win7</code> on{' '}
                    <code>lan_0</code> at{' '}
                    <code>192.168.56.121</code>.
                  </span>
                </>
              )}

              {activeTarget === 'router-endpoint' && (
                <>
                  <strong>Endpoint</strong>

                  <span>
                    Places <code>router</code> on{' '}
                    <code>lan_0</code> at{' '}
                    <code>192.168.56.122</code>.
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.actionLinks}>

          <Link
            className={styles.workbenchLink}
            to="/workbench/">
            Explore in the Workbench
          </Link>

          <p className={styles.safetyNote}>
            Browser-based inspection only. The Workbench does not
            start virtual machines or deploy infrastructure.
          </p>

          <Link
            className={styles.textLink}
            to="/docs/getting-started/first-scenario">
            Learn how scenarios are written →
          </Link>
        </div>
      </div>
    </section>
  );
}