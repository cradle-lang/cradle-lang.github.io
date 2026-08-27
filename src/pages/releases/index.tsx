import {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';

import releaseNotes from '../../data/release-notes.json';

import styles from './releases.module.css';

type ReleaseNote = {
  version: string;
  fileName: string;
  content: string;
};

export default function ReleasesPage(): ReactNode {
  const notes = releaseNotes as ReleaseNote[];
  const [selectedVersion, setSelectedVersion] = useState(
    notes.at(-1)?.version ?? '',
  );
  const selectedNote = notes.find(
    (note) => note.version === selectedVersion,
  ) ?? notes.at(-1);

  useEffect(() => {
    const versionFromHash = decodeURIComponent(window.location.hash.slice(1));

    if (notes.some((note) => note.version === versionFromHash)) {
      setSelectedVersion(versionFromHash);
    }
  }, [notes]);

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
                  {notes.map((note, index) => (
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

                      {index === notes.length - 1 && (
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
                        {selectedNote.version === notes.at(-1)?.version && (
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
