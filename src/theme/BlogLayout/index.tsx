import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useVisibleBlogSidebarItems} from '@docusaurus/plugin-content-blog/client';
import Layout from '@theme/Layout';
import type {Props} from '@theme/BlogLayout';

import styles from './styles.module.css';

const formatDate = (date: Date | string) => new Intl.DateTimeFormat('en-SG', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(date));

export default function BlogLayout({sidebar, toc, children, ...props}: Props): ReactNode {
  const {pathname} = useLocation();
  const items = useVisibleBlogSidebarItems(sidebar?.items ?? []);
  const blogUrl = useBaseUrl('/blog/');
  const isIndex = /\/blog\/?$|\/blog\/page\/\d+\/?$/.test(pathname);

  return (
    <Layout {...props}>
      <main className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>CRADLE JOURNAL</p>
            {isIndex ? <h1>Blog</h1> : <Link className={styles.back} to={blogUrl}>← All posts</Link>}
            {isIndex && (
              <p className={styles.description}>
                Ideas, practical guides and perspectives on reproducible cyber experimentation.
              </p>
            )}
            <div className={styles.resources}>
              <Link to="/blog/archive">Archive</Link>
              <Link to="/blog/tags">Topics</Link>
            </div>
          </header>

          <div className={`${styles.layout} ${items.length === 0 ? styles.withoutSidebar : ''} ${toc ? styles.withToc : ''}`}>
            {items.length > 0 && (
              <aside className={styles.sidebar}>
                <p className={styles.navigationLabel}>{sidebar?.title ?? 'Recent posts'}</p>
                <nav aria-label="Blog posts, newest first">
                  {items.map((item, index) => {
                    const active = pathname.replace(/\/$/, '') === item.permalink.replace(/\/$/, '');
                    return (
                      <Link
                        key={item.permalink}
                        to={item.permalink}
                        aria-current={active ? 'page' : undefined}
                        className={`${styles.navigationItem} ${active ? styles.active : ''}`}>
                        <span className={styles.navigationMeta}>
                          <time dateTime={new Date(item.date).toISOString()}>{formatDate(item.date)}</time>
                          {index === 0 && <span className={styles.latest}>Latest</span>}
                        </span>
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            )}
            <div className={styles.content}>
              {toc && (
                <details className={styles.mobileToc}>
                  <summary>On this page</summary>
                  {toc}
                </details>
              )}
              {children}
            </div>
            {toc && <aside className={styles.toc} aria-label="On this page">{toc}</aside>}
          </div>
        </div>
      </main>
    </Layout>
  );
}
