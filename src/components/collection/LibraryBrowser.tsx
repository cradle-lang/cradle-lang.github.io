import {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {libraryScenarios} from './library';
import type {Scenario} from './catalog';
import {matchesScenarioSearch} from './search';
import Icon from './LibraryIcon';
import ScenarioArtwork from './ScenarioArtwork';
import styles from './LibraryBrowser.module.css';

export default function LibraryBrowser({onLoad}: {onLoad: (scenario: Scenario) => boolean}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('All');
  const [domain, setDomain] = useState('All');
  useEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal();
      searchInput.current?.focus();
    }
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  const filtered = libraryScenarios.filter((scenario) =>
    (source === 'All' || source === scenario.source) &&
    (domain === 'All' || domain === scenario.category) &&
    matchesScenarioSearch(scenario, query));
  return <>
    <button ref={opener} type="button" className={styles.trigger} onClick={() => setOpen(true)}><Icon name="book" size={15} />Browse library <span aria-hidden="true">⌄</span></button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="library-browser-title" onClose={() => {setOpen(false); opener.current?.focus();}}>
      <div className={styles.header}><div><span>CRADLE LIBRARY</span><h2 id="library-browser-title">Find your next range.</h2><p>Open a published specification in your Workbench.</p></div><button type="button" className={styles.close} aria-label="Close library browser" onClick={() => setOpen(false)}><Icon name="close" size={19} /></button></div>
      <div className={styles.search}><Icon name="search" size={16} /><input ref={searchInput} type="search" aria-label="Search library scenarios" placeholder="Search scenarios, keywords or descriptions…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className={styles.body}>
        <aside className={styles.filters}>
          <div role="group" aria-label="Source"><strong>Source</strong>{['All', ...new Set(libraryScenarios.map(({source: name}) => name))].map((name) => <button key={name} type="button" aria-pressed={source === name} className={source === name ? styles.active : ''} onClick={() => setSource(name)}>{name}</button>)}</div>
          <div role="group" aria-label="Domain"><strong>Domain</strong>{['All', ...new Set(libraryScenarios.map(({category}) => category))].map((name) => <button key={name} type="button" aria-pressed={domain === name} className={domain === name ? styles.active : ''} onClick={() => setDomain(name)}>{name}</button>)}</div>
        </aside>
        <div className={styles.results}><span className={styles.count} role="status">{filtered.length} {filtered.length === 1 ? 'scenario' : 'scenarios'} available</span>
          {filtered.map((scenario) => <article className={styles.scenario} key={scenario.id}><ScenarioArtwork scenario={scenario} className={styles.art} /><div className={styles.copy}><div className={styles.title}><h3>{scenario.name}</h3><span>{scenario.source}</span></div><p>{scenario.description}</p><div className={styles.meta}><span>{scenario.category}</span><span>{scenario.parsed.instances.length} instances</span><span>{scenario.parsed.networks.length} networks</span></div><div className={styles.actions}><Link to={`/collection/?scenario=${scenario.id}`} onClick={() => setOpen(false)}>View details ↗</Link><button type="button" onClick={() => {if (onLoad(scenario)) setOpen(false);}}>Load in Workbench <Icon name="arrow" size={13} /></button></div></div></article>)}
          {!filtered.length && <div className={styles.empty}><Icon name="search" size={25} /><h3>No matching scenarios</h3><p>Try a different keyword or clear your filters.</p><button type="button" onClick={() => {setQuery(''); setSource('All'); setDomain('All');}}>Clear filters</button></div>}
        </div>
      </div>
      <footer><span>Your current source stays in place until you load a scenario.</span><Link to="/collection/" onClick={() => setOpen(false)}>Explore the library <Icon name="external" size={12} /></Link></footer>
    </dialog>
  </>;
}
