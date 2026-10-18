import {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import cards from '../../../theme/BlogArchivePage/styles.module.css';
import topics from '../../../theme/BlogTagsListPage/styles.module.css';
import styles from './styles.module.css';
import shared from '../../../theme/BlogLayout/styles.module.css';

type Tag = {label: string; permalink: string; description?: string};
type Post = {
  title: string; description: string; date: string; permalink: string;
  readingTime?: number; authors: {name?: string}[]; tags: Tag[];
};
const PAGE_SIZE = 10;
const dateFormat = new Intl.DateTimeFormat('en-SG', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});

export default function BlogExplorer({topicPath, showTopics = false, timeline = false}: {topicPath?: string; showTopics?: boolean; timeline?: boolean}): ReactNode {
  const [customDatesOpen, setCustomDatesOpen] = useState(false);
  const {posts = []} = (usePluginData('blog-search-index') ?? {}) as {posts: Post[]};
  const {pathname, search} = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(search);
  const oldestFirst = params.get('sort') === 'oldest';
  const query = params.get('q') ?? '';
  const year = params.get('year') ?? '';
  const selectedTags = [...new Set(params.getAll('tag').filter(Boolean))];
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const scoped = posts.filter((post) => !topicPath || post.tags.some((item) => item.permalink === topicPath));
  const tags = [...new Map(scoped.flatMap((post) => post.tags).map((item) => [item.permalink, item])).values()]
    .sort((a, b) => a.label.localeCompare(b.label));
  const years = [...new Set(scoped.map((post) => post.date.slice(0, 4)))].sort().reverse();
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = scoped.filter((post) => {
    const text = `${post.title} ${post.description} ${post.tags.map((item) => `${item.label} ${item.description ?? ''} ${item.permalink.split('/').pop()}`).join(' ')}`.toLowerCase();
    const day = post.date.slice(0, 10);
    return tokens.every((token) => text.includes(token)) &&
      (!year || day.startsWith(year)) && (!from || day >= from) && (!to || day <= to) &&
      (selectedTags.length === 0 || post.tags.some((item) => selectedTags.includes(item.permalink)));
  }).sort((a, b) => (oldestFirst ? 1 : -1) * (Date.parse(a.date) - Date.parse(b.date)) || a.permalink.localeCompare(b.permalink));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Number.isSafeInteger(requestedPage) ? Math.max(1, Math.min(requestedPage, totalPages)) : 1;
  const update = (key: string, value: string | string[]) => {
    const next = new URLSearchParams(search);
    next.delete('page');
    next.delete(key);
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry) next.append(key, entry);
    }
    history.replace({pathname, search: next.toString() ? `?${next}` : ''});
  };
  const toggleTag = (value: string) => update('tag', selectedTags.includes(value)
    ? selectedTags.filter((entry) => entry !== value)
    : [...selectedTags, value]);
  const pageHref = (nextPage: number) => {
    const next = new URLSearchParams(search);
    if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page');
    return `${pathname}${next.size ? `?${next}` : ''}`;
  };
  const reset = () => {
    setCustomDatesOpen(false);
    history.replace({pathname, search: oldestFirst ? '?sort=oldest' : ''});
  };
  const active = Boolean(query || year || selectedTags.length || from || to);
  const topicResults = tags.map((item) => ({...item, count: filtered.filter((post) => post.tags.some((entry) => entry.permalink === item.permalink)).length}))
    .filter((item) => item.count > 0 && (selectedTags.length === 0 || selectedTags.includes(item.permalink)))
    .sort((a, b) => filtered.findIndex((post) => post.tags.some((item) => item.permalink === a.permalink)) - filtered.findIndex((post) => post.tags.some((item) => item.permalink === b.permalink)) || a.label.localeCompare(b.label));
  const visiblePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const yearGroups = [...new Set(filtered.map((post) => post.date.slice(0, 4)))].map((value) => ({year: value, posts: filtered.filter((post) => post.date.startsWith(value))}));
  const latestPermalink = [...scoped].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0]?.permalink;

  return (
    <>
      <section className={styles.filters} aria-label="Search and filter blog articles">
        <label className={styles.search}>Search articles
          <span className={styles.searchField}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            <input type="search" placeholder="Find a title, topic or tag…" value={query} onChange={(event) => update('q', event.target.value)} />
          </span>
        </label>
        <label className={styles.sort}>Sort by<select aria-label="Sort by" value={oldestFirst ? 'oldest' : 'newest'} onChange={(event) => update('sort', event.target.value === 'newest' ? '' : 'oldest')}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
        </select></label>
        <div className={styles.browseRow}>
          <div className={styles.topicChips} role="group" aria-label="Filter by topic">
            <button type="button" aria-pressed={selectedTags.length === 0} className={selectedTags.length === 0 ? styles.selectedChip : styles.topicChip} onClick={() => update('tag', '')}>All topics <span>{scoped.length}</span></button>
            {tags.map((item) => <button key={item.permalink} type="button" aria-pressed={selectedTags.includes(item.permalink)} className={selectedTags.includes(item.permalink) ? styles.selectedChip : styles.topicChip} onClick={() => toggleTag(item.permalink)}>
              {item.label}<span>{scoped.filter((post) => post.tags.some((entry) => entry.permalink === item.permalink)).length}</span>
            </button>)}
          </div>
          <div className={styles.dateRange}>
            <p className={styles.filterHint}>Choose one or more topics</p>
            <div className={styles.dateToolbar}>
              <span className={styles.dateHeading}>Published</span>
              <div className={styles.yearOptions} role="group" aria-label="Publication year">
                {['', ...years].map((value) => <button key={value || 'all'} type="button" aria-pressed={year === value} className={year === value ? styles.yearSelected : styles.yearOption} onClick={() => update('year', value)}>{value || 'All years'}</button>)}
              </div>
              <details className={styles.customDates} open={customDatesOpen} onToggle={(event) => setCustomDatesOpen(event.currentTarget.open)}>
                <summary><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18" /></svg>Custom range{(from || to) && <span className={styles.dateActive} aria-label="Date range applied" />} <span className={styles.rangeChevron} aria-hidden="true">⌄</span></summary>
                <div className={styles.dateFields}>
                  <label>Start date<input type="date" aria-label="From" onInput={(event) => update('from', event.currentTarget.value)} value={from} max={to || undefined} onChange={(event) => update('from', event.target.value)} /></label>
                  <label>End date<input type="date" aria-label="To" onInput={(event) => update('to', event.currentTarget.value)} value={to} min={from || undefined} onChange={(event) => update('to', event.target.value)} /></label>
                </div>
              </details>
            </div>
          </div>
        </div>

      </section>
      <div className={styles.status} role="status">
        <span>{filtered.length} {filtered.length === 1 ? 'article' : 'articles'}{showTopics ? ` across ${topicResults.length} ${topicResults.length === 1 ? 'topic' : 'topics'}` : ''}{active ? ` · ${scoped.length} total` : ''}</span>
        {active && <button className={styles.reset} type="button" onClick={reset}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>Clear all filters</button>}
      </div>
      {from && to && from > to && <p role="alert">Choose a start date on or before the end date.</p>}
      {filtered.length === 0 && <div className={styles.empty}><h2>No matching articles</h2><p>Try a different title or topic, widen the date range, or clear the filters.</p></div>}
      {showTopics ? (
        <ul className={topics.grid}>
          {topicResults.map((item) => {
            const linkParams = new URLSearchParams(search); linkParams.delete('page');
            return <li key={item.permalink}><Link className={topics.card} to={`${item.permalink}${linkParams.size ? `?${linkParams}` : ''}`}>
              <span className={topics.count}>{item.count} {item.count === 1 ? 'article' : 'articles'}{active ? ' matching' : ''}</span>
              <h2>{item.label}</h2><p>{item.description || `Explore articles about ${item.label}.`}</p><span className={topics.action}>View articles <span aria-hidden="true">→</span></span>
            </Link></li>;
          })}
        </ul>
      ) : timeline ? (
        <div className={`${styles.readingLayout} ${styles.timelineLayout}`}>
          {yearGroups.length > 0 && <aside className={styles.sidebar}>
            <p className={shared.navigationLabel}>Jump to year</p>
            <nav aria-label="Archive years">
              {yearGroups.map((group) => <a key={group.year} className={`${shared.navigationItem} ${styles.yearLink}`} href={`#year-${group.year}`}>
                <span>{group.year}</span><span className={styles.yearCount}>{group.posts.length} {group.posts.length === 1 ? 'article' : 'articles'}</span>
              </a>)}
            </nav>
          </aside>}
          <div className={styles.articles}>
            {yearGroups.map((group) => <section key={group.year} id={`year-${group.year}`} className={styles.yearGroup} aria-labelledby={`heading-${group.year}`}>
              <header className={styles.yearHeader}><h2 id={`heading-${group.year}`}>{group.year}</h2><span>{group.posts.length} {group.posts.length === 1 ? 'article' : 'articles'}</span></header>
              <ol className={styles.timeline}>
                {group.posts.map((post) => <li key={post.permalink} className={styles.timelineEntry}>
                  <article>
                    <div className={cards.meta}>
                      <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
                      {post.permalink === latestPermalink && <span className={cards.latest}>Latest article</span>}
                      {post.readingTime != null && <span>{Math.max(1, Math.ceil(post.readingTime))} min read</span>}
                    </div>
                    <h3><Link to={post.permalink}>{post.title}</Link></h3>
                    <p>{post.description}</p>
                    <ul className={cards.tags} aria-label="Article topics">{post.tags.map((item) => <li key={item.permalink}><Link to={item.permalink}>{item.label}</Link></li>)}</ul>
                  </article>
                </li>)}
              </ol>
            </section>)}
          </div>
        </div>
      ) : (
        <div className={styles.readingLayout}>
          {visiblePosts.length > 0 && <aside className={styles.sidebar}>
            <p className={shared.navigationLabel}>On this page</p>
            <nav aria-label="Jump to article">
              {visiblePosts.map((post, index) => <a key={post.permalink} className={shared.navigationItem} href={`#article-${index}`}>
                <span className={shared.navigationMeta}><time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>{post.permalink === latestPermalink && <span className={shared.latest}>Latest</span>}</span>
                <span>{post.title}</span>
              </a>)}
            </nav>
          </aside>}
          <div className={styles.articles}>
          {visiblePosts.map((post, index) => (
            <article key={post.permalink} id={`article-${index}`} className={`${cards.article} ${styles.article}`}>
              <div className={cards.meta}>{post.permalink === latestPermalink && <span className={cards.latest}>Latest article</span>}<time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
                {post.readingTime != null && <span>{Math.max(1, Math.ceil(post.readingTime))} min read</span>}
              </div>
              <h2 className={styles.title}><Link to={post.permalink}>{post.title}</Link></h2>
              <p className={cards.authors}>{post.authors.map((author) => author.name).filter(Boolean).join(', ')}</p>
              <p className={cards.description}>{post.description}</p>
              <div className={cards.articleFooter}>
                <ul className={cards.tags} aria-label="Article topics">{post.tags.map((item) => <li key={item.permalink}><Link to={item.permalink}>{item.label}</Link></li>)}</ul>
                <Link className={cards.readMore} to={post.permalink} aria-label={`Read ${post.title}`}>Read more <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          ))}
          {totalPages > 1 && <nav className={cards.pagination} aria-label="Article pages">
            {page > 1 ? <Link to={pageHref(page - 1)}>← Previous page</Link> : <span />}
            <span>Page {page} of {totalPages}</span>
            {page < totalPages ? <Link to={pageHref(page + 1)}>Next page →</Link> : <span />}
          </nav>}
          </div>
        </div>
      )}
    </>
  );
}
