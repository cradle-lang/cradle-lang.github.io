import {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';

import releaseNotesData from '../../data/release-notes.json';

import styles from './releases.module.css';

type ReleaseNote = {
  version: string;
  fileName: string;
  content: string;
};

type ReleaseNotesData = {
  current: ReleaseNote[];
  versions: Record<string, ReleaseNote[]>;
};

const VERSION_STORAGE_KEY = 'cradle-docs-version';
const VERSION_CHANGE_EVENT = 'cradle-docs-version-change';

export default function ReleasesPage(): ReactNode {
  const releaseNotes = releaseNotesData as ReleaseNotesData;
  const [docsVersion, setDocsVersion] = useState('current');
  const notes = docsVersion === 'current'
    ? releaseNotes.current
    : releaseNotes.versions[docsVersion] ?? releaseNotes.current;
  const latestNote = notes.at(-1);
  const displayedNotes = [...notes].reverse();
  const [selectedVersion, setSelectedVersion] = useState(
    latestNote?.version ?? '',
  );
  const selectedNote = notes.find(
    (note) => note.version === selectedVersion,
  ) ?? latestNote;

  useEffect(() => {
    const selectVersion = (version: string | null) => {
      setDocsVersion(
        version && version !== 'current' && releaseNotes.versions[version]
          ? version
          : 'current',
      );
    };

    const handleVersionChange = (event: Event) => {
      selectVersion(
        (event as CustomEvent<{version: string}>).detail.version,
      );
    };

    selectVersion(localStorage.getItem(VERSION_STORAGE_KEY));
    window.addEventListener(VERSION_CHANGE_EVENT, handleVersionChange);

    return () => {
      window.removeEventListener(VERSION_CHANGE_EVENT, handleVersionChange);
    };
  }, [releaseNotes.versions]);

  useEffect(() => {
    const versionFromHash = decodeURIComponent(window.location.hash.slice(1));

    if (notes.some((note) => note.version === versionFromHash)) {
      setSelectedVersion(versionFromHash);
    } else {
      setSelectedVersion(latestNote?.version ?? '');
    }
  }, [docsVersion, latestNote?.version, notes]);

  function selectRelease(version: string) {
    setSelectedVersion(version);
    window.history.replaceState(null, '', `#${encodeURIComponent(version)}`);
  }

  return (
    <Layout
      title="Release Notes"
      description="CRADLE releases, release notes and version history.">

      <main className={styles.releasesPage}>
        <div className={styles.pageInner}>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>
              CRADLE RELEASES
            </p>

            <h1>
              Release notes
            </h1>

            <p className={styles.pageDescription}>
              Review published CRADLE releases, explore new capabilities
              and understand changes between versions.
            </p>
          </header>

          {notes.length > 0 && selectedNote ? (
            <div className={styles.releaseLayout}>

              <aside className={styles.releaseNavigation}>
                <p className={styles.navigationLabel}>
                  Releases
                </p>

                <nav aria-label="Release history">
                  {displayedNotes.map((note) => (
                    <button
                      key={note.fileName}
                      type="button"
                      aria-pressed={note.version === selectedNote.version}
                      onClick={() => selectRelease(note.version)}
                      className={`${styles.navigationItem} ${
                        note.version === selectedNote.version
                          ? styles.navigationItemActive
                          : ''
                      }`}>

                      <span>
                        {note.version}
                      </span>

                      {note.version === latestNote?.version && (
                        <span className={styles.latestBadge}>
                          Latest
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </aside>

              <div className={styles.releaseHistory}>
                <article
                  id={selectedNote.version}
                  className={styles.release}>

                  <header className={styles.releaseHeader}>
                    <div>
                      <div className={styles.releaseMeta}>
                        {selectedNote.version === latestNote?.version && (
                          <span className={styles.latestLabel}>
                            Latest release
                          </span>
                        )}

                        <span className={styles.releaseTag}>
                          {selectedNote.version}
                        </span>
                      </div>
                    </div>
                  </header>

                  <div className={styles.releaseNotes}>
                    <ReactMarkdown>
                      {selectedNote.content}
                    </ReactMarkdown>
                  </div>
                </article>
              </div>
            </div>
          ) : (
            /* =====================================================
               EMPTY STATE
               ===================================================== */

            <section className={styles.emptyState}>
              <p className={styles.emptyLabel}>
                No published releases
              </p>

              <h2>
                CRADLE releases will appear here.
              </h2>

              <p>
                Published CRADLE releases and their release notes will
                appear on this page automatically when they become
                available.
              </p>
            </section>
          )}

          <div className={styles.backToDocs}>
            <button
              type="button"
              onClick={() => {
                const referrer = document.referrer;

                if (referrer) {
                  try {
                    const referrerUrl = new URL(referrer);

                    if (
                      referrerUrl.origin === window.location.origin
                    ) {
                      window.history.back();
                      return;
                    }
                  } catch {
                    // Fall back to the homepage below.
                  }
                }

                window.location.href = '/';
              }}>
              ← Back
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
