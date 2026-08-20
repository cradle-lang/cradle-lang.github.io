import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import releases from '../../../data/releases.json';

import sharedStyles from '../Homepage.module.css';
import styles from './LatestRelease.module.css';

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

const GITHUB_REPOSITORY =
  'https://github.com/cradle-lang/cradle-release';

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

export default function LatestRelease(): ReactNode {
  const releaseData = releases as Release[];

  const latestRelease = releaseData.find(
    (release) => !release.prerelease,
  );

  return (
    <section className={styles.releases}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.releasesInner}`}>

        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>
            GET CRADLE
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            Download the latest release.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            Get the latest packaged release, review what changed or explore
            the project source on GitHub.
          </p>
        </div>

        {latestRelease ? (
          <div className={styles.releasePanel}>
            <div className={styles.releaseSummary}>
              <div>
                <span className={styles.latestLabel}>
                  Latest release
                </span>

                <h3>{latestRelease.name}</h3>

                {latestRelease.publishedAt && (
                  <p className={styles.releaseDate}>
                    {new Date(
                      latestRelease.publishedAt,
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>

              <div className={styles.releaseActions}>
                <Link
                  className={styles.primaryAction}
                  to="/releases/">
                  Release notes
                </Link>

                <a
                  className={styles.secondaryAction}
                  href={latestRelease.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer">
                  View on GitHub ↗
                </a>
              </div>
            </div>

            {latestRelease.assets.length > 0 ? (
              <div className={styles.assets}>
                <p className={styles.assetsHeading}>
                  Downloads
                </p>

                <div className={styles.assetList}>
                  {latestRelease.assets.map((asset) => (
                    <a
                      key={asset.id}
                      className={styles.asset}
                      href={asset.downloadUrl}>

                      <span className={styles.assetName}>
                        {asset.name}
                      </span>

                      <span className={styles.assetSize}>
                        {formatFileSize(asset.size)}
                      </span>

                      <span
                        className={styles.assetArrow}
                        aria-hidden="true">
                        ↓
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.noAssets}>
                <p>
                  This release does not currently provide packaged binaries.
                </p>

                <a
                  href={latestRelease.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer">
                  View the release on GitHub →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noRelease}>
            <div>
              <span className={styles.latestLabel}>
                Source repository
              </span>

              <h3>No packaged releases yet.</h3>

              <p>
                CRADLE is currently available from its GitHub repository.
              </p>
            </div>

            <a
              className={styles.primaryAction}
              href={GITHUB_REPOSITORY}
              target="_blank"
              rel="noopener noreferrer">
              View GitHub Repository ↗
            </a>
          </div>
        )}
      </div>
    </section>
  );
}