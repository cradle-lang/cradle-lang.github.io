import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import WorkbenchConsole from './components/WorkbenchConsole';
import WorkbenchEditor from './components/WorkbenchEditor';
import WorkbenchInspector from './components/WorkbenchInspector';
import WorkbenchMetrics from './components/WorkbenchMetrics';

import Visualization from './components/visualization/Visualization';

import {
  parseCradleForWorkbench,
} from './utils/cradleParser';

import {
  downloadTextFile,
} from './utils/download';

import {
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

export default function Workbench(): ReactNode {
  const [source, setSource] =
    useState('');

  const [parsed, setParsed] =
    useState<ParsedCradle | null>(
      null,
    );

  const [view, setView] =
    useState<WorkbenchView>(
      'topology',
    );

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

        window.localStorage.setItem(
          SOURCE_STORAGE,
          source,
        );

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
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        log(
          `Parser error: ${message}`,
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

    try {
      setParsed(
        parseCradleForWorkbench(
          initialSource,
        ),
      );
    } catch {
      setParsed(null);
    }

    log(
      'Workbench ready. Edit or import a CRADLE scenario.',
    );
  }, [log]);

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

          setSource(content);

          setNodePositions({});
          setNetworkPositions({});

          const result =
            parseCradleForWorkbench(content);

          setParsed(result);

          log(
            `Imported ${file.name}.`,
            'success',
          );
        } catch (error) {
          log(
            `Import failed: ${
              error instanceof Error
                ? error.message
                : String(error)
            }`,
            'error',
          );
        } finally {
          event.target.value = '';
        }
      },
      [log],
    );

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

  return (
    <main
      className={
        styles.workbench
      }
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
        >
          <span
            className={
              styles.statusDot
            }
          />

          {parsed
            ? `${parsed.instances.length} instances · ${parsed.networks.length} networks · ${parsed.events.length} events`
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
                onClick={() => {
                  setSource(
                    SAMPLE_SCENARIO,
                  );

                  setNodePositions(
                    {},
                  );

                  setNetworkPositions(
                    {},
                  );

                  window.setTimeout(
                    () => {
                      const result =
                        parseCradleForWorkbench(
                          SAMPLE_SCENARIO,
                        );

                      setParsed(
                        result,
                      );
                    },
                    0,
                  );

                  log(
                    'Loaded sample scenario.',
                  );
                }}
              >
                Load sample
              </button>

              <button
                type="button"
                onClick={generateVisualization}
              >
                Format
              </button>

              <button
                type="button"
                className={
                  styles.dangerButton
                }
                onClick={() => {
                  setSource('');
                  setParsed(null);
                  setSelection(null);
                  setNodePositions(
                    {},
                  );
                  setNetworkPositions(
                    {},
                  );

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
              >
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
              >
                <button
                  type="button"
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
                >
                  Topology
                </button>

                <button
                  type="button"
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
                >
                  Event flow
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
            className={
              styles.canvas
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