import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';

import releases from '../../data/releases.json';

import styles from './releases.module.css';

type Release = {
  id: number;
  tagName: string;
  name: string;
  body: string;
  publishedAt: string | null;
  htmlUrl: string;
  prerelease: boolean;
};

function formatDate(date: string | null): string {
  if (!date) {
    return 'Publication date unavailable';
  }

  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ReleasesPage(): ReactNode {
  const releaseData = releases as Release[];

  const publishedReleases = releaseData.filter(
    (release) => !release.prerelease,
  );

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
              Release notes (Coming Soon in September 2026)
            </h1>

            <p className={styles.pageDescription}>
              Review published CRADLE releases, explore new capabilities
              and understand changes between versions.
            </p>
          </header>

          {publishedReleases.length > 0 ? (
            <div className={styles.releaseLayout}>
              {/* =====================================================
                  RELEASE NAVIGATION
                  ===================================================== */}

              <aside className={styles.releaseNavigation}>
                <p className={styles.navigationLabel}>
                  Releases
                </p>

                <nav aria-label="Release history">
                  {publishedReleases.map((release, index) => (
                    <a
                      key={release.id}
                      href={`#${release.tagName}`}
                      className={styles.navigationItem}>

                      <span>
                        {release.name || release.tagName}
                      </span>

                      {index === 0 && (
                        <span className={styles.latestBadge}>
                          Latest
                        </span>
                      )}
                    </a>
                  ))}
                </nav>
              </aside>

              {/* =====================================================
                  RELEASE HISTORY
                  ===================================================== */}

              <div className={styles.releaseHistory}>
                {publishedReleases.map((release, index) => (
                  <article
                    key={release.id}
                    id={release.tagName}
                    className={styles.release}>

                    <header className={styles.releaseHeader}>
                      <div>
                        <div className={styles.releaseMeta}>
                          {index === 0 && (
                            <span className={styles.latestLabel}>
                              Latest release
                            </span>
                          )}

                          <span className={styles.releaseTag}>
                            {release.tagName}
                          </span>
                        </div>

                        <h2>
                          {release.name || release.tagName}
                        </h2>

                        <p className={styles.releaseDate}>
                          Published {formatDate(release.publishedAt)}
                        </p>
                      </div>

                      <a
                        className={styles.githubReleaseLink}
                        href={release.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer">
                        Release details ↗
                      </a>
                    </header>

                    {release.body ? (
                      <div className={styles.releaseNotes}>
                        <ReactMarkdown>
                          {release.body}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className={styles.emptyNotes}>
                        No release notes were provided for this release.
                      </p>
                    )}
                  </article>
                ))}
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

          {/* =====================================================
              BACK
              ===================================================== */}

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