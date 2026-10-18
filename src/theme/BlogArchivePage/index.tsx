import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {PageMetadata} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import BlogExplorer from '@site/src/components/blog/BlogExplorer';
import shared from '../BlogLayout/styles.module.css';

export function BlogBrowsePage({archive = false}: {archive?: boolean}): ReactNode {
  return <Layout>
    <PageMetadata title={archive ? 'Blog archive' : 'CRADLE Blog'} description="Project updates, practical guides and perspectives on reproducible cyber experimentation." />
    <main className={shared.page}><div className={shared.inner}>
      <header className={shared.header}>
        <p className={shared.eyebrow}>CRADLE JOURNAL</p><h1>{archive ? 'Blog archive' : 'Blog'}</h1>
        <p className={shared.description}>{archive
          ? 'Explore the CRADLE journal through the years. Follow the timeline or jump to a year to revisit earlier articles.'
          : 'Ideas, practical guides and perspectives on reproducible cyber experimentation. Find an article by title, topic or publication date.'}</p>
        <div className={shared.resources}><Link to="/blog/">All posts</Link><Link to="/blog/archive">Archive</Link><Link to="/blog/tags">Topics</Link></div>
      </header>
      <section style={{marginTop: 48}} aria-label={archive ? 'Archived articles' : 'All blog posts'}><BlogExplorer timeline={archive} /></section>
    </div></main>
  </Layout>;
}
export default function BlogArchivePage(): ReactNode { return <BlogBrowsePage archive />; }
