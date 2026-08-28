import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import WorkbenchConsole from './components/WorkbenchConsole';
import WorkbenchEditor from './components/WorkbenchEditor';
import WorkbenchInspector from './components/WorkbenchInspector';
import WorkbenchMetrics from './components/WorkbenchMetrics';

import Visualization from './components/visualization/Visualization';

import {
  parseCradleForWorkbench,
  WorkbenchParseError,
} from './utils/cradleParser';

import {
  downloadTextFile,
} from './utils/download';

import {
  ADVANCED_SAMPLE_SCENARIO,
  SAMPLE_SCENARIO,
} from './data/sampleScenario';

import type {
  ConsoleMessage,
  ParsedCradle,
  Point,
  Selection,
  WorkbenchView,
} from './types/workbench';

import styles from './Workbench.module.css';

const SOURCE_STORAGE =
  'cradleWorkbenchSource';

type WorkbenchErrorGuidance = {
  title: string;
  detail: string;
  sourceLine?: string;
  suggestion: string;
};

type MobileWorkbenchPane =
  | 'source'
  | 'visualization'
  | 'inspector';

function describeWorkbenchError(
  error: unknown,
): WorkbenchErrorGuidance {
  if (error instanceof WorkbenchParseError) {
    return {
      title: `Check line ${error.line}`,
      detail: error.message,
      sourceLine: error.sourceLine,
      suggestion: error.suggestion,
    };
  }

  return {
    title: 'The scenario could not be processed',
    detail:
      error instanceof Error
        ? error.message
        : String(error),
    suggestion:
      'Review the source and compare its section order with the HelloWorld-Win example.',
  };
}

export default function Workbench(): ReactNode {
  const [source, setSource] =
    useState('');

  const [parsed, setParsed] =
    useState<ParsedCradle | null>(
      null,
    );

  const [visualizedSource, setVisualizedSource] =
    useState<string | null>(null);

  const [sourceLoaded, setSourceLoaded] =
    useState(false);

  const [view, setView] =
    useState<WorkbenchView>(
      'topology',
    );

  const [mobilePane, setMobilePane] =
    useState<MobileWorkbenchPane>('source');

  const [selection, setSelection] =
    useState<Selection>(null);

  const [showLabels, setShowLabels] =
    useState(true);

  const [showObjects, setShowObjects] =
    useState(true);

  const [
    nodePositions,
    setNodePositions,
  ] = useState<
    Record<string, Point>
  >({});

  const [
    networkPositions,
    setNetworkPositions,
  ] = useState<
    Record<string, Point>
  >({});

  const [messages, setMessages] =
    useState<ConsoleMessage[]>(
      [],
    );

  const [parseError, setParseError] =
    useState<WorkbenchErrorGuidance | null>(
      null,
    );

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const messageId =
    useRef(0);

  const log = useCallback(
    (
      message: string,
      type:
        | 'info'
        | 'success'
        | 'warning'
        | 'error' = 'info',
    ) => {
      messageId.current += 1;

      setMessages(
        (previous) => [
          ...previous.slice(-79),
          {
            id: messageId.current,
            timestamp: new Date(),
            type,
            message,
          },
        ],
      );
    },
    [],
  );

  const generateVisualization =
    useCallback(() => {
      try {
        const result =
          parseCradleForWorkbench(source);

        setParsed(result);
        setVisualizedSource(source);
        setSelection(null);
        setNodePositions({});
        setNetworkPositions({});
        setParseError(null);

        log(
          `Generated ${
            result.metadata.name ??
            'Unnamed'
          }: ${
            result.instances.length
          } instances, ${
            result.networks.length
          } networks and ${
            result.events.length
          } events.`,
          result.warnings.length
            ? 'warning'
            : 'success',
        );
      } catch (error) {
        const guidance =
          describeWorkbenchError(error);

        setParsed(null);
        setVisualizedSource(null);
        setSelection(null);
        setNodePositions({});
        setNetworkPositions({});
        setParseError(guidance);

        log(
          `${guidance.title}: ${guidance.detail} ${guidance.suggestion}`,
          'error',
        );
      }
    }, [source, log]);

  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        SOURCE_STORAGE,
      );

    const initialSource =
      saved || SAMPLE_SCENARIO;

    setSource(initialSource);
    setSourceLoaded(true);

    try {
      const result =
        parseCradleForWorkbench(
          initialSource,
        );

      setParsed(result);
      setVisualizedSource(initialSource);
      setParseError(null);
    } catch (error) {
      const guidance =
        describeWorkbenchError(error);

      setParsed(null);
      setVisualizedSource(null);
      setParseError(guidance);

      log(
        `${guidance.title}: ${guidance.detail} ${guidance.suggestion}`,
        'error',
      );
    }

    log('Workbench ready. Edit or import a CRADLE scenario.');
  }, [log]);

  useEffect(() => {
    if (!sourceLoaded) {
      return;
    }

    if (source) {
      window.localStorage.setItem(
        SOURCE_STORAGE,
        source,
      );
    } else {
      window.localStorage.removeItem(
        SOURCE_STORAGE,
      );
    }
  }, [source, sourceLoaded]);

  const confirmReplacement =
    useCallback(
      (
        nextSource: string,
        action: string,
      ): boolean => {
        if (
          !source.trim() ||
          source === nextSource
        ) {
          return true;
        }

        return window.confirm(
          `${action} will replace the current source. Export it first if you want to keep a separate copy. Continue?`,
        );
      },
      [source],
    );

  const loadSample =
    useCallback(
      (
        nextSource: string,
        label: string,
      ): void => {
        if (
          !confirmReplacement(
            nextSource,
            `Loading ${label}`,
          )
        ) {
          log(
            `Canceled loading ${label}.`,
          );
          return;
        }

        const result =
          parseCradleForWorkbench(
            nextSource,
          );

        setSource(nextSource);
        setParsed(result);
        setVisualizedSource(nextSource);
        setSelection(null);
        setNodePositions({});
        setNetworkPositions({});
        setParseError(null);

        log(
          `Loaded ${label}.`,
          'success',
        );
      },
      [confirmReplacement, log],
    );

  const handleImport =
    useCallback(
      async (
        event: React.ChangeEvent<HTMLInputElement>,
      ) => {
        const file =
          event.target.files?.[0];

        if (!file) {
          return;
        }

        try {
          const content =
            await file.text();

          const result =
            parseCradleForWorkbench(content);

          if (
            !confirmReplacement(
              content,
              `Importing ${file.name}`,
            )
          ) {
            log(
              `Canceled importing ${file.name}.`,
            );
            return;
          }

          setSource(content);
          setParsed(result);
          setVisualizedSource(content);
          setSelection(null);
          setNodePositions({});
          setNetworkPositions({});
          setParseError(null);

          log(
            `Imported ${file.name}.`,
            'success',
          );
        } catch (error) {
          const guidance =
            describeWorkbenchError(error);

          setParseError(guidance);

          log(
            `Import failed. ${guidance.title}: ${guidance.detail} ${guidance.suggestion}`,
            'error',
          );
        } finally {
          event.target.value = '';
        }
      },
      [confirmReplacement, log],
    );

  const visualizationOutdated =
    parsed !== null &&
    visualizedSource !== null &&
    source !== visualizedSource;

  function handleExport(): void {
    const rawName =
      String(
        parsed?.metadata.name ??
          'scenario',
      );

    const safeName =
      rawName
        .trim()
        .replace(
          /[^a-z0-9_-]+/gi,
          '-',
        )
        .replace(
          /^-+|-+$/g,
          '',
        ) || 'scenario';

    downloadTextFile(
      `${safeName}.cradle`,
      'text/plain;charset=utf-8',
      source,
    );

    log(
      `Exported ${safeName}.cradle.`,
      'success',
    );
  }

  function handleNodeMove(
    key: string,
    position: Point,
  ): void {
    setNodePositions(
      (previous) => ({
        ...previous,
        [key]: position,
      }),
    );
  }

  function handleNetworkMove(
    id: string,
    position: Point,
  ): void {
    setNetworkPositions(
      (previous) => ({
        ...previous,
        [id]: position,
      }),
    );
  }

  function handleViewTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ): void {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    event.preventDefault();

    const views: WorkbenchView[] = [
      'topology',
      'events',
      'summary',
    ];

    const currentIndex =
      views.indexOf(view);

    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? views.length - 1
          : event.key === 'ArrowRight'
            ? (currentIndex + 1) % views.length
            : (currentIndex - 1 + views.length) % views.length;

    const nextView = views[nextIndex];

    setView(nextView);

    window.requestAnimationFrame(() => {
      document
        .getElementById(
          `visualization-tab-${nextView}`,
        )
        ?.focus();
    });
  }

  return (
    <main
      className={
        styles.workbench
      }
      data-mobile-pane={mobilePane}
    >
      <header
        className={
          styles.topbar
        }
      >
        <div
          className={
            styles.brand
          }
        >
          <div
            className={
              styles.brandmark
            }
          >
            CR
          </div>

          <div
            className={
              styles.brandCopy
            }
          >
            <strong>
              CRADLE Workbench
            </strong>

            <span>
              Author and inspect a
              scenario
            </span>
          </div>
        </div>

        <div
          className={
            styles.status
          }
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            className={
              styles.statusDot
            }
            aria-hidden="true"
          />

          {parsed
            ? `${parsed.instances.length} instances · ${parsed.networks.length} networks · ${parsed.events.length} events${visualizationOutdated ? ' · Changes not visualized' : ''}`
            : 'Ready'}
        </div>

        <div
          className={
            styles.topActions
          }
        >
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            Import .cradle
          </button>

          <button
            type="button"
            onClick={
              handleExport
            }
          >
            Export .cradle
          </button>

          <button
            type="button"
            className={
              styles.primaryButton
            }
            onClick={generateVisualization}
          >
            Generate visualization
          </button>

          <input
            ref={fileInputRef}
            className={
              styles.hiddenInput
            }
            type="file"
            accept=".cradle,.txt,text/plain"
            onChange={handleImport}
          />
        </div>
      </header>

      <nav
        className={styles.mobilePaneTabs}
        aria-label="Workbench panel"
      >
        {(
          [
            ['source', 'Source'],
            ['visualization', 'Visualization'],
            ['inspector', 'Inspector'],
          ] as const
        ).map(([pane, label]) => (
          <button
            key={pane}
            type="button"
            aria-pressed={mobilePane === pane}
            className={
              mobilePane === pane
                ? styles.mobilePaneTabActive
                : styles.mobilePaneTab
            }
            onClick={() => setMobilePane(pane)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div
        className={
          styles.workspace
        }
      >
        <section
          className={
            styles.sourcePane
          }
        >
          <header
            className={
              styles.paneHeader
            }
          >
            <div
              className={
                styles.paneTitle
              }
            >
              <strong>
                CRADLE source
              </strong>

              <span
                className={
                  styles.fileBadge
                }
              >
                scenario.cradle
              </span>
            </div>

            <div
              className={
                styles.paneActions
              }
            >
              <button
                type="button"
                onClick={() =>
                  loadSample(
                    SAMPLE_SCENARIO,
                    'HelloWorld-Win sample',
                  )
                }
              >
                Load Hello World
              </button>

              <button
                type="button"
                onClick={() =>
                  loadSample(
                    ADVANCED_SAMPLE_SCENARIO,
                    'advanced SME sample',
                  )
                }
              >
                Load advanced sample
              </button>

              <button
                type="button"
                onClick={generateVisualization}
              >
                Refresh visualization
              </button>

              <button
                type="button"
                className={
                  styles.dangerButton
                }
                onClick={() => {
                  if (
                    !confirmReplacement(
                      '',
                      'Creating a new scenario',
                    )
                  ) {
                    log(
                      'Canceled creating a new scenario.',
                    );
                    return;
                  }

                  setSource('');
                  setParsed(null);
                  setVisualizedSource(null);
                  setSelection(null);
                  setNodePositions(
                    {},
                  );
                  setNetworkPositions(
                    {},
                  );
                  setParseError(null);

                  log(
                    'Created new scenario.',
                  );
                }}
              >
                New
              </button>
            </div>
          </header>

          <div
            className={
              styles.editor
            }
          >
            <WorkbenchEditor
              source={source}
              onChange={
                setSource
              }
            />
          </div>

          <div
            className={
              styles.bottomPanels
            }
          >
            <section
              className={
                styles.consolePanel
              }
            >
              <h3>
                Console
              </h3>

              <div
                className={
                  styles.consoleBody
                }
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {parseError && (
                  <div
                    className={styles.errorGuidance}
                    role="alert"
                  >
                    <strong>{parseError.title}</strong>
                    <span>{parseError.detail}</span>
                    {parseError.sourceLine && (
                      <code>{parseError.sourceLine}</code>
                    )}
                    <span>
                      Next: {parseError.suggestion}{' '}
                      <a href="/docs/guides/write-a-scenario">
                        Review the scenario guide
                      </a>
                      .
                    </span>
                  </div>
                )}

                <WorkbenchConsole
                  messages={
                    messages
                  }
                />
              </div>
            </section>

            <section
              className={
                styles.inspectorPanel
              }
            >
              <h3>
                Inspector
              </h3>

              <div
                className={
                  styles.inspectorBody
                }
              >
                <WorkbenchInspector
                  parsed={parsed}
                  selection={
                    selection
                  }
                />
              </div>
            </section>
          </div>

          <footer
            className={
              styles.metrics
            }
          >
            <WorkbenchMetrics
              parsed={parsed}
            />
          </footer>
        </section>

        <section
          className={
            styles.visualPane
          }
        >
          <header
            className={
              styles.viewbar
            }
          >
            <div
              className={
                styles.visualTitle
              }
            >
              <strong>
                Visualization
              </strong>

              <span
                className={
                  styles.fileBadge
                }
              >
                {String(
                  parsed
                    ?.metadata
                    .name ??
                    'Unnamed',
                )}
              </span>
            </div>

            <div
              className={
                styles.viewActions
              }
            >
              <div
                className={
                  styles.tabs
                }
                role="tablist"
                aria-label="Visualization view"
              >
                <button
                  type="button"
                  id="visualization-tab-topology"
                  role="tab"
                  aria-selected={
                    view === 'topology'
                  }
                  aria-controls="workbench-visualization-panel"
                  tabIndex={
                    view === 'topology'
                      ? 0
                      : -1
                  }
                  className={
                    view ===
                    'topology'
                      ? styles.activeTab
                      : styles.tab
                  }
                  onClick={() =>
                    setView(
                      'topology',
                    )
                  }
                  onKeyDown={(event) =>
                    handleViewTabKeyDown(event)
                  }
                >
                  Topology
                </button>

                <button
                  type="button"
                  id="visualization-tab-events"
                  role="tab"
                  aria-selected={
                    view === 'events'
                  }
                  aria-controls="workbench-visualization-panel"
                  tabIndex={
                    view === 'events'
                      ? 0
                      : -1
                  }
                  className={
                    view ===
                    'events'
                      ? styles.activeTab
                      : styles.tab
                  }
                  onClick={() =>
                    setView(
                      'events',
                    )
                  }
                  onKeyDown={(event) =>
                    handleViewTabKeyDown(event)
                  }
                >
                  Event flow
                </button>

                <button
                  type="button"
                  id="visualization-tab-summary"
                  role="tab"
                  aria-selected={view === 'summary'}
                  aria-controls="workbench-visualization-panel"
                  tabIndex={view === 'summary' ? 0 : -1}
                  className={
                    view === 'summary'
                      ? styles.activeTab
                      : styles.tab
                  }
                  onClick={() => setView('summary')}
                  onKeyDown={handleViewTabKeyDown}
                >
                  Text summary
                </button>
              </div>

              <label
                className={
                  styles.toggle
                }
              >
                <input
                  type="checkbox"
                  checked={
                    showLabels
                  }
                  onChange={(
                    event,
                  ) =>
                    setShowLabels(
                      event.target
                        .checked,
                    )
                  }
                />

                Labels
              </label>

              <label
                className={
                  styles.toggle
                }
              >
                <input
                  type="checkbox"
                  checked={
                    showObjects
                  }
                  onChange={(
                    event,
                  ) =>
                    setShowObjects(
                      event.target
                        .checked,
                    )
                  }
                />

                Objects
              </label>
            </div>
          </header>

          <div
            id="workbench-visualization-panel"
            className={`${styles.canvas}${
              view === 'events'
                ? ` ${styles.scrollableCanvas}`
                : ''
            }`}
            role="tabpanel"
            aria-labelledby={
              `visualization-tab-${view}`
            }
          >
            {parsed && (
              <Visualization
                parsed={parsed}
                view={view}
                showLabels={
                  showLabels
                }
                showObjects={
                  showObjects
                }
                nodePositions={
                  nodePositions
                }
                networkPositions={
                  networkPositions
                }
                onNodeMove={
                  handleNodeMove
                }
                onNetworkMove={
                  handleNetworkMove
                }
                onSelect={
                  setSelection
                }
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
