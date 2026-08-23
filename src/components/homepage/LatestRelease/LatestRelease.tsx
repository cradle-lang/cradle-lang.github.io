import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';

import releases from '../../../data/releases.json';

import sharedStyles from '../Homepage.module.css';
import styles from './LatestRelease.module.css';
import TerminalAnimation from './TerminalAnimation';

type ReleaseAsset = {
  id: number;
  name: string;
  size: number;
  downloadCount: number;
  downloadUrl: string;
};

type Release = {
  id: number;
  tagName: string;
  name: string;
  body: string;
  publishedAt: string | null;
  htmlUrl: string;
  prerelease: boolean;
  assets: ReleaseAsset[];
};

const QUICK_START_URL = '/docs/getting-started/quick-start';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(1)} MB`;
}

function formatReleaseDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function LatestRelease(): ReactNode {
  const releaseData = releases as Release[];

  const latestRelease = releaseData.find(
    (release) => !release.prerelease,
  );

  return (
    <section className={styles.releases}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.releasesInner}`}
      >
        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>
            Get CRADLE
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            Download the latest release.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            Get the latest packaged version of CRADLE for your
            environment.
          </p>
        </div>

        <div className={styles.releaseGrid}>
          {/* =====================================================
              DOWNLOAD
              ===================================================== */}

          <div className={styles.downloadPanel}>
            {latestRelease ? (
              <>
                <div className={styles.panelHeader}>
                  <span className={styles.panelLabel}>
                    Latest release
                  </span>

                  <h3>
                    {latestRelease.name ||
                      latestRelease.tagName}
                  </h3>

                  {latestRelease.publishedAt && (
                    <p className={styles.releaseDate}>
                      Released{' '}
                      {formatReleaseDate(
                        latestRelease.publishedAt,
                      )}
                    </p>
                  )}
                </div>

                {latestRelease.assets.length > 0 ? (
                  <div className={styles.downloads}>
                    <div className={styles.downloadsHeader}>
                      <span>Downloads</span>

                      <span className={styles.assetCount}>
                        {latestRelease.assets.length}{' '}
                        {latestRelease.assets.length === 1
                          ? 'asset'
                          : 'assets'}
                      </span>
                    </div>

                    <div className={styles.assetList}>
                      {latestRelease.assets.map((asset) => (
                        <a
                          key={asset.id}
                          className={styles.asset}
                          href={asset.downloadUrl}
                        >
                          <span className={styles.assetName}>
                            {asset.name}
                          </span>

                          <span className={styles.assetSize}>
                            {formatFileSize(asset.size)}
                          </span>

                          <span
                            className={styles.assetArrow}
                            aria-hidden="true"
                          >
                            ↓
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyDownloads}>
                    <p>
                      No packaged files are available for this
                      release yet.
                    </p>
                  </div>
                )}

                <div className={styles.panelFooter}>
                  <Link
                    className={styles.primaryAction}
                    to="/releases/"
                  >
                    Release notes →
                  </Link>

                  <a
                    className={styles.textAction}
                    href={latestRelease.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub ↗
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className={styles.panelHeader}>
                  <span className={styles.panelLabel}>
                    Packaged release
                  </span>

                  <h3>
                    No release available yet.
                  </h3>

                  <p className={styles.panelDescription}>
                    The first packaged CRADLE release has not
                    been published yet.
                  </p>
                </div>

                <div className={styles.releasePlaceholder}>
                  <div className={styles.placeholderIcon}>
                    ↓
                  </div>

                  <div>
                    <strong>
                      Packaged downloads coming soon
                    </strong>

                    <span>
                      Release assets will appear here when
                      published.
                    </span>
                  </div>
                </div>

                <div className={styles.panelFooter}>
                  <Link
                    className={styles.primaryAction}
                    to="/releases/"
                  >
                    View releases →
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* =====================================================
              QUICK START
              ===================================================== */}

          <div className={styles.quickStartPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>
                Quick Start
              </span>

              <h3>
                Run CRADLE.
              </h3>

              <p className={styles.panelDescription}>
                Follow the introductory workflow and generate
                your first CRADLE deployment.
              </p>
            </div>

            <div className={styles.terminalWrapper}>
              <TerminalAnimation />
            </div>

            <div className={styles.panelFooter}>
              <Link
                className={styles.textAction}
                to={QUICK_START_URL}
              >
                Open Quick Start →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}