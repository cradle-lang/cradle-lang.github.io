import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';

import releases from '../../data/releases.json';

import styles from './releases.module.css';

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

function formatDate(date: string | null): string {
    if (!date) {
        return 'Publication date unavailable';
    }

    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kilobytes = bytes / 1024;

    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(1)} KB`;
    }

    const megabytes = kilobytes / 1024;

    if (megabytes < 1024) {
        return `${megabytes.toFixed(1)} MB`;
    }

    const gigabytes = megabytes / 1024;

    return `${gigabytes.toFixed(1)} GB`;
}

export default function ReleasesPage(): ReactNode {
    const releaseData = releases as Release[];

    const publishedReleases = releaseData.filter(
        (release) => !release.prerelease,
    );

    return (
        <Layout
            title="Release Notes"
            description="CRADLE releases, release notes and downloadable artifacts.">

            <main className={styles.releasesPage}>
                <div className={styles.pageInner}>
                    <header className={styles.pageHeader}>
                        <p className={styles.eyebrow}>
                            CRADLE RELEASES
                        </p>

                        <h1>Release notes</h1>

                        <p className={styles.pageDescription}>
                            Review published CRADLE releases, see what changed and download
                            available release artifacts.
                        </p>

                        <a
                            className={styles.repositoryLink}
                            href={GITHUB_REPOSITORY}
                            target="_blank"
                            rel="noopener noreferrer">
                            View release repository on GitHub ↗
                        </a>
                    </header>

                    {publishedReleases.length > 0 ? (
                        <div className={styles.releaseLayout}>
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
                                                {release.name}
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

                                                <h2>{release.name}</h2>

                                                <p className={styles.releaseDate}>
                                                    Published {formatDate(release.publishedAt)}
                                                </p>
                                            </div>

                                            <a
                                                className={styles.githubReleaseLink}
                                                href={release.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                GitHub ↗
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

                                        {release.assets.length > 0 && (
                                            <section className={styles.downloads}>
                                                <h3>Downloads</h3>

                                                <div className={styles.downloadList}>
                                                    {release.assets.map((asset) => (
                                                        <a
                                                            key={asset.id}
                                                            className={styles.downloadItem}
                                                            href={asset.downloadUrl}>

                                                            <div>
                                                                <span className={styles.downloadName}>
                                                                    {asset.name}
                                                                </span>

                                                                <span className={styles.downloadMeta}>
                                                                    {formatFileSize(asset.size)}
                                                                </span>
                                                            </div>

                                                            <span
                                                                className={styles.downloadArrow}
                                                                aria-hidden="true">
                                                                ↓
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <section className={styles.emptyState}>
                            <p className={styles.emptyLabel}>
                                No published releases
                            </p>

                            <h2>CRADLE releases will appear here.</h2>

                            <p>
                                No published GitHub Releases are currently available.
                                Packaged releases and their release notes will appear on this
                                page automatically when they are published.
                            </p>

                            <a
                                className={styles.primaryAction}
                                href={GITHUB_REPOSITORY}
                                target="_blank"
                                rel="noopener noreferrer">
                                View release repository ↗
                            </a>
                        </section>
                    )}

                    <div className={styles.backToDocs}>
                        <button
                            type="button"
                            onClick={() => {
                                const referrer = document.referrer;

                                if (
                                    referrer &&
                                    new URL(referrer).origin === window.location.origin
                                ) {
                                    window.history.back();
                                } else {
                                    window.location.href = '/';
                                }
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </main>
        </Layout>
    );
}