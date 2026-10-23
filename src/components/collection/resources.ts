import type {Scenario} from './catalog';
import type {ParsedCradle} from '../workbench/types/workbench';

export type LibraryScenario = Scenario & {parsed: ParsedCradle};
type Article = {name: string; description: string; docUrl: string};
export type DocumentedResources = {
  configurations: (Article & {key: string; os: string; category: string})[];
  heuristics: (Article & {type: string; value: string})[];
};

export function mergeResources(libraryScenarios: LibraryScenario[], documents: DocumentedResources) {
  // A standalone article can enrich a discovered reference or add a new entry.
  const configNames = new Set([
    ...libraryScenarios.flatMap(({parsed}) => parsed.instances.flatMap(({configs}) => configs)),
    ...documents.configurations.map(({key}) => key),
  ]);
  const configurations = [...configNames].sort().map((name) => {
    const article = documents.configurations.find(({key}) => key === name);
    const usedBy = libraryScenarios.filter(({parsed}) => parsed.instances.some(({configs}) => configs.includes(name)));
    const operatingSystems = new Set(usedBy.flatMap(({parsed}) => parsed.instances.filter(({configs}) => configs.includes(name)).map(({os}) => os?.name.toLowerCase()).filter(Boolean).map((os) => os === 'windows' ? 'Windows' : ['linux', 'ubuntu', 'debian', 'centos'].includes(os!) ? 'Linux' : 'Unspecified')));
    return {
      name,
      title: article?.name || name,
      description: article?.description || 'Configuration referenced by a published scenario. Add a library article to document its implementation and requirements.',
      os: article?.os || (operatingSystems.size > 1 ? 'Cross-platform' : [...operatingSystems][0] || 'Unspecified'),
      category: article?.category || 'Other',
      docUrl: article?.docUrl,
      scenarios: usedBy,
    };
  });

  const heuristicUsages = libraryScenarios.flatMap((scenario) => [
    {id: 'metadata', heuristics: scenario.parsed.metadataHeuristics || []},
    ...scenario.parsed.instances, ...scenario.parsed.events, ...scenario.parsed.objects,
  ].flatMap((component) => component.heuristics.map((heuristic) => ({...heuristic, component: component.id, scenario}))));
  const heuristicKey = (type: string, value: string) => `${type.toLowerCase()}:${value.toLowerCase()}`;
  const heuristicPairs = new Map([
    ...heuristicUsages.map(({type, value}) => [heuristicKey(type, value), {type: type.toLowerCase(), value}] as const),
    ...documents.heuristics.map(({type, value}) => [heuristicKey(type, value), {type, value}] as const),
  ]);
  const heuristics = [...heuristicPairs.values()].map(({type, value}) => {
    const article = documents.heuristics.find((entry) => heuristicKey(entry.type, entry.value) === heuristicKey(type, value));
    const usages = heuristicUsages.filter((entry) => heuristicKey(entry.type, entry.value) === heuristicKey(type, value));
    return {
      type, value,
      name: article?.name || value,
      description: article?.description || 'Heuristic annotation discovered in a published specification.',
      docUrl: article?.docUrl,
      usages,
      scenarios: libraryScenarios.filter((scenario) => usages.some((usage) => usage.scenario.id === scenario.id)),
    };
  });
  const frameworks = [...new Set(heuristics.map(({type}) => type))].sort();
  return {configurations, heuristicUsages, heuristics, frameworks};
}
