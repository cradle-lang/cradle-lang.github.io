import type {ReactNode} from 'react';
import BlogExplorer from '@site/src/components/blog/BlogExplorer';
import Link from '@docusaurus/Link';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/BlogTagsListPage';

import shared from '../BlogLayout/styles.module.css';
import styles from './styles.module.css';

export default function BlogTagsListPage({tags}: Props): ReactNode {

  return (
    <HtmlClassNameProvider className={`${ThemeClassNames.wrapper.blogPages} ${ThemeClassNames.page.blogTagsListPage}`}>
      <PageMetadata title="Blog topics" description="Find CRADLE articles by topic, from project updates to practical guides." />
      <SearchMetadata tag="blog_tags_list" />
      <Layout>
        <main className={shared.page}>
          <div className={shared.inner}>
            <header className={shared.header}>
              <p className={shared.eyebrow}>CRADLE JOURNAL</p>
              <h1>Explore by topic</h1>
              <p className={shared.description}>
                Find something that interests you. Search, filter by date, or choose a topic to explore its articles.
              </p>
              <div className={shared.resources}>
                <Link to="/blog/">← All posts</Link>
                <Link to="/blog/archive">Browse archive</Link>
              </div>
            </header>

            <section className={styles.section} aria-label="Blog topics">
              <BlogExplorer showTopics />
            </section>
          </div>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
