import {useEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {scenarioSource, validationWorkflow} from '../components/collection/catalog';
import {configurations, frameworks, heuristics, heuristicUsages, libraryScenarios, type LibraryScenario} from '../components/collection/library';
import Icon from '../components/collection/LibraryIcon';
import ScenarioArtwork from '../components/collection/ScenarioArtwork';
import ScenarioSummary from '../components/workbench/components/visualization/ScenarioSummary';
import TopologyView from '../components/workbench/components/visualization/TopologyView';
import type {Point, Selection} from '../components/workbench/types/workbench';
import {downloadTextFile} from '../components/workbench/utils/download';
import styles from './collection.module.css';

type Section = 'overview' | 'scenarios' | 'heuristics' | 'configurations' | 'frameworks' | 'tags';
const availableTags = [...new Set(libraryScenarios.flatMap(({tags}) => tags))].sort((a, b) => a.localeCompare(b));
const sections: {id: Section; label: string; description: string; count: number}[] = [
  {id: 'scenarios', label: 'Scenarios', description: 'Ready-to-use cyber ranges. Discover a specification, explore its topology and make it your own.', count: libraryScenarios.length},
  {id: 'tags', label: 'Tags', description: 'Explore every scenario tag and discover the ranges that use it.', count: availableTags.length},
  {id: 'heuristics', label: 'Heuristics', description: 'Reusable annotations and security framework mappings from published scenarios and contributor-written entries.', count: heuristics.length},
  {id: 'configurations', label: 'Configurations', description: 'Reusable instance configurations for networking, services, monitoring and system settings.', count: configurations.length},
  {id: 'frameworks', label: 'Frameworks', description: 'External frameworks referenced by the heuristics in this collection.', count: frameworks.length},
];
const detailTabs = ['Overview', 'Report', 'Topology', 'Components', 'Events', 'Heuristics', 'Provenance', 'Source'] as const;
type DetailTab = typeof detailTabs[number];
function libraryUrl(section: Section = 'overview') {return `/collection/${section === 'overview' ? '' : `?section=${section}`}`;}
function detailUrl(id: string) {return `/collection/?scenario=${id}`;}

function Tags({scenario}: {scenario: LibraryScenario}) {
  return <div className={styles.tags}><span>{scenario.category}</span>{scenario.tags.filter((tag) => tag.toLowerCase() !== scenario.category.toLowerCase()).slice(0, 2).map((tag) => <span className={styles.neutralTag} key={tag}>{tag}</span>)}<span className={styles.readyTag}><Icon name="check" size={12} />Published</span></div>;
}
function Metrics({scenario}: {scenario: LibraryScenario}) {
  return <div className={styles.metrics}><span><Icon name="monitor" size={15} />{scenario.parsed.instances.length} instances</span><span><Icon name="network" size={15} />{scenario.parsed.networks.length} {scenario.parsed.networks.length === 1 ? 'network' : 'networks'}</span><span><Icon name="configurations" size={15} />{scenario.parsed.events.length} {scenario.parsed.events.length === 1 ? 'event' : 'events'}</span></div>;
}
function ScenarioCard({scenario}: {scenario: LibraryScenario}) {
  return <article className={styles.scenarioCard}>
    <Link to={detailUrl(scenario.id)} className={styles.artLink} aria-label={`Explore ${scenario.name}`}><ScenarioArtwork scenario={scenario} className={styles.cardArt} /></Link>
    <div className={styles.cardBody}>
      <div className={styles.cardTitle}><Link to={detailUrl(scenario.id)}>{scenario.name}</Link><span className={styles.sourceBadge}>{scenario.source}</span></div>
      <p>{scenario.description}</p><Tags scenario={scenario} /><Metrics scenario={scenario} />
      <div className={styles.cardFooter}><Link to={detailUrl(scenario.id)}>Explore scenario <Icon name="arrow" size={15} /></Link><Link to={`/workbench/?scenario=${scenario.id}`} title={`Open ${scenario.name} in Workbench`}>Open in Workbench <Icon name="external" size={13} /></Link></div>
    </div>
  </article>;
}
function EmptyState({title, children}: {title: string; children: ReactNode}) {
  return <div className={styles.empty}><span className={styles.emptyIcon}><Icon name="search" size={25} /></span><h3>{title}</h3><p>{children}</p></div>;
}
function ScenarioDetail({scenario}: {scenario: LibraryScenario}) {
  const [tab, setTab] = useState<DetailTab>('Overview');
  const [nodePositions, setNodePositions] = useState<Record<string, Point>>({});
  const [networkPositions, setNetworkPositions] = useState<Record<string, Point>>({});
  const [selection, setSelection] = useState<Selection>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const ownHeuristics = heuristicUsages.filter((entry) => entry.scenario.id === scenario.id);
  function showReport() {
    setTab('Report');
    tabsRef.current?.querySelector<HTMLButtonElement>('#detail-tab-Report')?.focus();
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>) {
    let next = detailTabs.indexOf(tab);
    if (event.key === 'ArrowRight') next = (next + 1) % detailTabs.length;
    else if (event.key === 'ArrowLeft') next = (next - 1 + detailTabs.length) % detailTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = detailTabs.length - 1;
    else return;
    event.preventDefault(); setTab(detailTabs[next]);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  }
  return <>
    <header className={styles.detailHeader}>
      <div><div className={styles.titleRow}><h1>{scenario.name}</h1><span className={styles.sourceBadge}>{scenario.source}</span></div><p>{scenario.description}</p><Tags scenario={scenario} /><Link className={styles.guideLink} to={scenario.docUrl}>Read scenario guide <Icon name="book" size={13} /></Link></div>
      <div className={styles.headerActions}><Link className={styles.primaryButton} to={`/workbench/?scenario=${scenario.id}`}>Open in Workbench <Icon name="arrow" size={15} /></Link><div><button className={styles.secondaryButton} onClick={() => downloadTextFile(`${scenario.id}.cradle`, 'text/plain;charset=utf-8', scenarioSource(scenario))}>Download .cradle</button></div></div>
    </header>
    <div ref={tabsRef} className={styles.tabs} role="tablist" aria-label="Scenario details">{detailTabs.map((name) => <button key={name} id={`detail-tab-${name}`} role="tab" aria-selected={tab === name} aria-controls="scenario-panel" tabIndex={tab === name ? 0 : -1} onKeyDown={tabKey} className={tab === name ? styles.activeTab : ''} onClick={() => setTab(name)}>{name}</button>)}</div>
    <section id="scenario-panel" role="tabpanel" aria-labelledby={`detail-tab-${tab}`} tabIndex={0} className={styles.tabPanel}>
      {tab === 'Overview' && <>
        <div className={styles.summaryGrid}>
          <ScenarioArtwork scenario={scenario} className={styles.detailArt} />
          <div className={styles.panel}><div className={styles.sectionEyebrow}>SCENARIO OVERVIEW</div><h2>A range you can build on.</h2><p>{scenario.description}</p><Metrics scenario={scenario} /><dl className={styles.facts}><div><dt>Original source</dt><dd>{scenario.source}</dd></div><div><dt>Domain</dt><dd>{scenario.category}</dd></div><div><dt>Specification</dt><dd>CRADLE</dd></div></dl></div>
        </div>
        <div className={styles.lowerGrid}><div className={styles.panel}><h3><Icon name="network" size={17} />Inside this range</h3><p>Connected environments defined in the specification.</p><div className={styles.networkList}>{scenario.parsed.networks.map((network) => <div key={network.id}><span><span className={styles.dot} />{network.id}</span><code>{network.subnet || 'Dynamic addressing'}</code><span>{network.endpoints.length} endpoints</span></div>)}</div><button className={styles.textButton} onClick={() => setTab('Topology')}>Explore topology <Icon name="arrow" size={15} /></button></div><CompilePanel scenario={scenario} onReport={showReport} /></div>
        <div className={styles.requirements}><Icon name="configurations" size={19} /><div><strong>Testbed requirements</strong><p>{scenario.requirements}</p></div></div>
      </>}
      {tab === 'Report' && <><div className={styles.panelHeading}><div><h2>Static scenario report</h2><p>Relationships declared in the published source, using the same text summary as Workbench. This report does not indicate a successful compiler check or runtime execution.</p></div><Metrics scenario={scenario} /></div><ScenarioSummary parsed={scenario.parsed} /></>}
      {tab === 'Topology' && <><div className={styles.panelHeading}><div><h2>Network topology</h2><p>Pan, zoom and select a component to explore the range.</p></div><Metrics scenario={scenario} /></div><div className={styles.topology}><TopologyView parsed={scenario.parsed} showLabels showObjects nodePositions={nodePositions} networkPositions={networkPositions} onNodeMove={(id, position) => setNodePositions((previous) => ({...previous, [id]: position}))} onNetworkMove={(id, position) => setNetworkPositions((previous) => ({...previous, [id]: position}))} onSelect={setSelection} /></div>{selection && <p className={styles.selection}><strong>{selection.type}:</strong> {selection.id}</p>}</>}
      {tab === 'Components' && <><div className={styles.panelHeading}><div><h2>Range components</h2><p>Instances and the configuration building blocks they use.</p></div><span className={styles.count}>{scenario.parsed.instances.length} instances</span></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Instance</th><th>Operating system</th><th>Configurations</th></tr></thead><tbody>{scenario.parsed.instances.map((instance) => <tr key={instance.id}><td><Icon name="monitor" size={15} /> <strong>{instance.id}</strong></td><td>{instance.os?.name || 'Unspecified'} {instance.os?.version}</td><td><div className={styles.configTags}>{instance.configs.map((config) => <Link key={config} to={`/collection/?section=configurations&q=${encodeURIComponent(config)}`}>{config}</Link>)}{!instance.configs.length && <span>None declared</span>}</div></td></tr>)}</tbody></table></div></>}
      {tab === 'Events' && <><div className={styles.panelHeading}><div><h2>Event sequence</h2><p>Actions and dependencies declared by the scenario.</p></div><span className={styles.count}>{scenario.parsed.events.length} events</span></div><div className={styles.events}>{scenario.parsed.events.map((event, index) => <article key={event.id}><span className={styles.eventNumber}>{String(index + 1).padStart(2, '0')}</span><div><h3>{event.description || event.id}</h3><code>{event.id}</code><p>Instance: <strong>{event.instance || 'Unspecified'}</strong>{event.runObject?.name && <> · Object: {event.runObject.name}</>}</p>{event.dependencies.length > 0 && <span className={styles.dependency}>Depends on {event.dependencies.join(', ')}</span>}</div></article>)}</div></>}
      {tab === 'Heuristics' && (ownHeuristics.length ? <div className={styles.resourceGrid}>{ownHeuristics.map((entry, index) => <div className={styles.panel} key={index}><Icon name="heuristics" /><h3>{entry.value}</h3><p>{entry.type} · {entry.component}</p></div>)}</div> : <EmptyState title="No heuristic annotations">This specification does not declare heuristic mappings. You can add them when adapting the scenario in Workbench.</EmptyState>)}
      {tab === 'Provenance' && <div className={styles.panel}><h2>Versioned at the source.</h2><p>Inspect the original source and validation history for this scenario.</p><dl className={styles.provenance}><div><dt>Contributor / source</dt><dd>{scenario.source}</dd></div><div><dt>Scenario identifier</dt><dd><code>{scenario.id}</code></dd></div><div><dt>Source file</dt><dd><code>{scenario.file}</code></dd></div><div><dt>Validation history</dt><dd><a href={validationWorkflow}>View GitHub workflow runs ↗</a></dd></div></dl><p>Validate a specific Git commit through the workflow. Its run summary records validation and compilation results, the source revision, compiler version and a static scenario report. This does not verify runtime dependencies or execute events.</p></div>}
      {tab === 'Source' && <><div className={styles.panelHeading}><div><h2>CRADLE specification</h2><p>The same source is used by Workbench and the Download .cradle button at the top.</p></div></div><pre className={styles.sourceCode}><code>{scenarioSource(scenario)}</code></pre></>}
    </section>
  </>;
}
function CompilePanel({scenario, onReport}: {scenario: LibraryScenario; onReport: () => void}) {
  return <div className={`${styles.panel} ${styles.compilePanel}`}>
    <span className={styles.iconBox}><Icon name="code" /></span>
    <h3>Validate and inspect.</h3>
    <p>Check this specification with GitHub Actions. Select <code>{scenario.id}</code> and a Git revision to validate and compile the source, then inspect the run’s static report.</p>
    <a className={styles.primaryButton} href={validationWorkflow}>Validate specification <Icon name="external" size={14} /></a>
    <button className={styles.textButton} onClick={onReport}>View static report <Icon name="arrow" size={15} /></button>
    <small>Read the validation results, source revision and compiler version in GitHub’s run summary. Use Download .cradle at the top for the specification.</small>
    <small>This checks the specification only. It does not provision infrastructure, run events or verify that runtime images, configurations and artifacts are available.</small>
  </div>;
}

export default function CollectionPage(): ReactNode {
  const location = useLocation();
  const history = useHistory();
  const isBrowser = useIsBrowser();
  const params = new URLSearchParams(isBrowser ? location.search : '');
  const scenarioId = params.get('scenario');
  const requestedSection = params.get('section') || (scenarioId ? 'scenarios' : 'overview');
  const section: Section = ['overview', ...sections.map(({id}) => id)].includes(requestedSection) ? requestedSection as Section : 'overview';
  const active = libraryScenarios.find(({id}) => id === scenarioId);
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [domain, setDomain] = useState('All');
  const selectedTags = [...new Set(params.getAll('tag'))].filter((tag) => availableTags.includes(tag));
  function setSelectedTags(value: string[] | ((previous: string[]) => string[])) {
    const next = typeof value === 'function' ? value(selectedTags) : value;
    params.delete('tag');
    next.forEach((tag) => params.append('tag', tag));
    history.replace({pathname: location.pathname, search: params.toString()});
  }
  const [os, setOs] = useState('All');
  const [sort, setSort] = useState('Name');
  useEffect(() => {
    setQuery(''); setSourceFilter('All'); setDomain('All'); setOs('All'); setSort('Name');
  }, [section]);
  const search = (params.get('q') ?? query).trim().toLowerCase();
  function updateQuery(value: string) {
    setQuery(value);
    if (params.has('q')) {params.delete('q'); history.replace({pathname: location.pathname, search: params.toString()});}
  }
  const filtered = libraryScenarios.filter((scenario) => (sourceFilter === 'All' || sourceFilter === scenario.source) && (domain === 'All' || domain === scenario.category) && selectedTags.every((tag) => scenario.tags.includes(tag)) && [scenario.name, scenario.category, scenario.description, ...scenario.tags].join(' ').toLowerCase().includes(search)).sort((a, b) => sort === 'Instances' ? b.parsed.instances.length - a.parsed.instances.length : a.name.localeCompare(b.name));
  const filteredConfigs = useMemo(() => configurations.filter((config) => (os === 'All' || config.os === os) && [config.name, config.title, config.description, config.category].join(" ").toLowerCase().includes(search)), [os, search]);
  const selectedSection = sections.find(({id}) => id === section);
  const pageTitle = active?.name || (section === 'overview' ? 'CRADLE Library' : selectedSection?.label || 'CRADLE Library');
  return <Layout title={pageTitle} description="Reusable CRADLE cyber ranges and building blocks. Discover, inspect, validate and compile published scenarios." noFooter>
    <div className={styles.library}>
      <aside className={styles.sidebar}>
        <Link to="/collection/" className={styles.sidebarBrand}><Icon name="book" size={18} />Library</Link>
        <nav aria-label="Library"><Link aria-current={section === 'overview' ? 'page' : undefined} className={section === 'overview' ? styles.currentNav : ''} to={libraryUrl()}><Icon name="overview" size={16} />Overview</Link>{sections.map(({id, label, count}) => <Link key={id} aria-current={section === id ? 'page' : undefined} className={section === id ? styles.currentNav : ''} to={libraryUrl(id)}><Icon name={id} size={16} />{label}<span>{count}</span></Link>)}</nav>
        <div className={styles.sidebarNote}><Icon name="code" size={20} /><strong>Build on what works.</strong><p>Explore a range. Make it yours. Share it back.</p><Link to="/docs/guides/contribute-scenario">Contribute a scenario <Icon name="arrow" size={13} /></Link></div>
      </aside>
      <main className={styles.content}>
        <div className={styles.breadcrumb}><Link to="/collection/"><Icon name="book" size={13} />Library</Link>{section !== 'overview' && <><span>›</span><Link to={libraryUrl(section)}>{selectedSection?.label}</Link></>}{active && <><span>›</span><span>{active.name}</span></>}</div>
        {scenarioId && !active && <p className={styles.requirements} role="status">That scenario is not in the library. Explore the available scenarios below.</p>}
        {active ? <ScenarioDetail key={active.id} scenario={active} /> : <>
          <header className={styles.pageHeader}><div><div className={styles.sectionEyebrow}>{section === 'overview' ? 'THE CRADLE COLLECTION' : 'LIBRARY / BUILDING BLOCKS'}</div><h1>{pageTitle}</h1><p>{section === 'overview' ? 'Reusable building blocks for cyber experimentation. Discover working scenarios, inspect their specifications and compile a versioned source for your own environment.' : selectedSection?.description}</p></div>{section === 'overview' && <Link to="/docs/guides/contribute-scenario" className={styles.secondaryButton}>Contribute <Icon name="arrow" size={14} /></Link>}</header>
          {section === 'overview' && <>
            <div className={styles.categoryGrid}>{sections.map(({id, label, description, count}) => <Link key={id} to={libraryUrl(id)} className={styles.categoryCard}><span className={styles.iconBox}><Icon name={id} size={23} /></span><h2>{label}</h2><p>{description}</p><div><span className={styles.count}>{count ? `${count} ${label.toLowerCase()}` : 'No entries yet'}</span><Icon name="arrow" size={18} /></div></Link>)}</div>
            <div className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>A PLACE TO START</span><h2>Explore the collection</h2><p>{libraryScenarios.length} specifications. A starting point for your next experiment.</p></div><Link to={libraryUrl('scenarios')} className={styles.textButton}>Browse scenarios <Icon name="arrow" size={15} /></Link></div>
            <div className={styles.scenarioGrid}>{libraryScenarios.map((scenario) => <ScenarioCard key={scenario.id} scenario={scenario} />)}</div>
            <div className={styles.contributionStrip}><span className={styles.iconBox}><Icon name="frameworks" size={24} /></span><div><h3>Better ranges start with shared knowledge.</h3><p>Contribute working scenarios with clear attribution and reproducible deployment requirements.</p></div><Link className={styles.textButton} to="/docs/guides/contribute-scenario">How to contribute <Icon name="arrow" size={15} /></Link></div>
          </>}
          {(section === 'scenarios' || section === 'configurations') && <>
            <div className={styles.searchField}><Icon name="search" size={17} /><input type="search" aria-label={`Search ${section}`} placeholder={section === 'scenarios' ? 'Search scenarios, tags, domains or descriptions…' : 'Search configuration names…'} value={params.get('q') ?? query} onChange={(event) => updateQuery(event.target.value)} /><kbd>Search</kbd></div>
            {section === 'scenarios' ? <div className={styles.filters}><Filter label="Source" options={['All', ...new Set(libraryScenarios.map(({source}) => source))]} value={sourceFilter} onChange={setSourceFilter} /><Filter label="Domain" options={['All', ...new Set(libraryScenarios.map(({category}) => category))]} value={domain} onChange={setDomain} /><div className={styles.filterRow}><span>Tags</span><div role="group" aria-label="Scenario tags"><button aria-pressed={!selectedTags.length} className={!selectedTags.length ? styles.activeFilter : ''} onClick={() => setSelectedTags([])}>All tags</button>{availableTags.map((tag) => <button key={tag} aria-pressed={selectedTags.includes(tag)} className={selectedTags.includes(tag) ? styles.activeFilter : ''} onClick={() => setSelectedTags((previous) => previous.includes(tag) ? previous.filter((value) => value !== tag) : [...previous, tag])}>{tag}</button>)}</div></div><div className={styles.tagFilterHint}><span>Match all selected tags.</span>{selectedTags.length > 0 && <button className={styles.textButton} onClick={() => setSelectedTags([])}>Clear tags ({selectedTags.length})</button>}</div></div> : <div className={styles.filters}><Filter label="OS" options={['All', ...new Set(configurations.map(({os}) => os))]} value={os} onChange={setOs} /></div>}
            <div className={styles.resultBar}><span role="status">Showing {section === 'scenarios' ? filtered.length : filteredConfigs.length} of {section === 'scenarios' ? libraryScenarios.length : configurations.length} {section}</span>{section === 'scenarios' && <label>Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Name</option><option>Instances</option></select></label>}</div>
            {section === 'scenarios' && (filtered.length ? <div className={styles.scenarioGrid}>{filtered.map((scenario) => <ScenarioCard key={scenario.id} scenario={scenario} />)}</div> : <EmptyState title="No matching scenarios">Try another keyword, source, domain or tag combination. <button className={styles.textButton} onClick={() => {updateQuery(''); setSourceFilter('All'); setDomain('All'); setSelectedTags([]);}}>Clear filters</button></EmptyState>)}
            {section === 'configurations' && (filteredConfigs.length ? <div className={styles.resourceGrid}>{filteredConfigs.map((config) => <article className={styles.configCard} key={config.name}><div className={styles.configTitle}><span className={styles.smallIcon}><Icon name={config.os === 'Windows' ? 'overview' : 'configurations'} size={19} /></span><h2>{config.name}</h2></div><span className={styles.count}>{config.os}</span><p>{config.description}</p>{config.docUrl && <Link className={styles.textButton} to={config.docUrl}>Read documentation <Icon name="arrow" size={13} /></Link>}<details><summary>Used by {config.scenarios.length} {config.scenarios.length === 1 ? 'scenario' : 'scenarios'} <Icon name="arrow" size={13} /></summary>{config.scenarios.map((scenario) => <Link key={scenario.id} to={detailUrl(scenario.id)}>{scenario.name} <Icon name="external" size={12} /></Link>)}</details></article>)}</div> : <EmptyState title="No matching configurations">Try another name or operating system.</EmptyState>)}
          </>}
          {section === 'tags' && <>
            <div className={styles.searchField}><Icon name="search" size={17} /><input type="search" aria-label="Search tags" placeholder="Search tags…" value={params.get('q') ?? query} onChange={(event) => updateQuery(event.target.value)} /></div>
            <div className={styles.resultBar}><span role="status">Showing {availableTags.filter((tag) => tag.toLowerCase().includes(search)).length} of {availableTags.length} tags</span></div>
            {availableTags.some((tag) => tag.toLowerCase().includes(search)) ? <div className={styles.resourceGrid}>{availableTags.filter((tag) => tag.toLowerCase().includes(search)).map((tag) => {
              const count = libraryScenarios.filter((scenario) => scenario.tags.includes(tag)).length;
              const url = `/collection/?${new URLSearchParams({section: 'scenarios', tag})}`;
              return <article className={styles.panel} key={tag}><Icon name="tags" /><h2><Link to={url}>{tag}</Link></h2><p>{count} {count === 1 ? 'scenario' : 'scenarios'}</p><Link className={styles.textButton} to={url}>View scenarios <Icon name="arrow" size={15} /></Link></article>;
            })}</div> : <EmptyState title="No matching tags">Try another keyword. <button className={styles.textButton} onClick={() => updateQuery('')}>Clear search</button></EmptyState>}
          </>}
          {section === 'heuristics' && (heuristics.length ? <div className={styles.resourceGrid}>{heuristics.map((entry, index) => <article className={styles.panel} key={index}><Icon name="heuristics" /><h2>{entry.name}</h2><p>{entry.type} · {entry.value}</p><p>{entry.description}</p>{entry.docUrl && <Link className={styles.textButton} to={entry.docUrl}>Read documentation <Icon name="arrow" size={13} /></Link>}<p>Used by {entry.scenarios.length} scenarios</p>{entry.scenarios.map((scenario) => <Link key={scenario.id} to={detailUrl(scenario.id)}>{scenario.name} → </Link>)}</article>)}</div> : <EmptyState title="Room for the next building block">The initial scenarios do not declare heuristic annotations. Add annotations to a scenario or contribute a standalone heuristic article to grow this collection. <Link to="/docs/language/heuristics" className={styles.textButton}>Learn about heuristics <Icon name="arrow" size={15} /></Link></EmptyState>)}
          {section === 'frameworks' && (frameworks.length ? <div className={styles.resourceGrid}>{frameworks.map((framework) => <article className={styles.panel} key={framework}><Icon name="frameworks" /><h2>{framework}</h2></article>)}</div> : <EmptyState title="Framework mappings grow with the library">No external frameworks are represented yet. Scenario annotations and standalone heuristic articles automatically populate this section. <Link to="/docs/language/heuristics" className={styles.textButton}>Explore framework annotations <Icon name="arrow" size={15} /></Link></EmptyState>)}
        </>}
        <footer className={styles.libraryFooter}><span>CRADLE Library</span><span>Discover. Adapt. Reproduce.</span><Link to="/docs/guides/contribute-scenario">Contribution guide ↗</Link></footer>
      </main>
    </div>
  </Layout>;
}
function Filter({label, options, value, onChange}: {label: string; options: string[]; value: string; onChange: (value: string) => void}) {
  return <div className={styles.filterRow}><span>{label}</span><div role="group" aria-label={label}>{options.map((option) => <button key={option} aria-pressed={value === option} className={value === option ? styles.activeFilter : ''} onClick={() => onChange(option)}>{option}</button>)}</div></div>;
}
