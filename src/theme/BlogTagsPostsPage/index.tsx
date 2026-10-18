import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import BlogExplorer from '@site/src/components/blog/BlogExplorer';
import SearchMetadata from '@theme/SearchMetadata';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import type {Props} from '@theme/BlogTagsPostsPage';

import shared from '../BlogLayout/styles.module.css';
import styles from '../BlogTagsListPage/styles.module.css';

export default function BlogTagsPostsPage({tag, items, listMetadata}: Props): ReactNode {
  return (
    <HtmlClassNameProvider className={`${ThemeClassNames.wrapper.blogPages} ${ThemeClassNames.page.blogTagPostListPage}`}>
      <PageMetadata title={`${tag.label} | Blog topics`} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
      <Layout>
        <main className={shared.page}>
          <div className={shared.inner}>
            <header className={shared.header}>
              <p className={shared.eyebrow}>BLOG TOPIC</p>
              <h1>{tag.label}</h1>
              {tag.description && <p className={shared.description}>{tag.description}</p>}
              <div className={shared.resources}>
                <Link to={tag.allTagsPath}>← All topics</Link>
                <Link to="/blog/">All posts</Link>
                <Link to="/blog/archive">Browse archive</Link>
              </div>
            </header>
            <section className={`${shared.content} ${styles.postList}`} aria-label={`${tag.label} articles`}>
              {tag.unlisted && <Unlisted />}
              <BlogExplorer topicPath={tag.permalink} />
            </section>
          </div>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
