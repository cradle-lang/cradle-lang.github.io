import type {Scenario} from './catalog';
import type {ParsedCradle} from '../workbench/types/workbench';

export type LibraryScenario = Scenario & {parsed: ParsedCradle};

export function configurationUsages(parsed: ParsedCradle) {
  const usages = new Map<string, string[]>();
  for (const instance of parsed.instances) {
    for (const config of new Set(instance.configs)) {
      const instances = usages.get(config) || [];
      if (!instances.includes(instance.id)) instances.push(instance.id);
      usages.set(config, instances);
    }
  }
  return [...usages].map(([name, instances]) => ({name, instances}))
    .sort((a, b) => a.name.localeCompare(b.name));
}
type Article = {name: string; description: string; docUrl: string; sourceUrl?: string};
export type DocumentedResources = {
  configurations: (Article & {key: string; os: string; category: string})[];
  heuristics: (Article & {type: string; value: string})[];
};

export function mergeResources(libraryScenarios: LibraryScenario[], documents: DocumentedResources) {
  // Published articles define membership; specifications supply usage links only.
  const configurations = documents.configurations.map((article) => ({
    name: article.key,
    title: article.name,
    description: article.description,
    os: article.os,
    category: article.category,
    docUrl: article.docUrl,
    sourceUrl: article.sourceUrl || `https://github.com/cradle-lang/cradle-lib/tree/main/configs/${encodeURIComponent(article.key)}`,
    scenarios: libraryScenarios.filter(({parsed}) => parsed.instances.some(({configs}) => configs.includes(article.key))),
  })).sort((a, b) => a.name.localeCompare(b.name));

  const heuristicUsages = libraryScenarios.flatMap((scenario) => [
    {id: 'metadata', heuristics: scenario.parsed.metadataHeuristics || []},
    ...scenario.parsed.instances, ...scenario.parsed.events, ...scenario.parsed.objects,
  ].flatMap((component) => component.heuristics.map((heuristic) => ({...heuristic, component: component.id, scenario}))));
  const heuristicKey = (type: string, value: string) => `${type.toLowerCase()}:${value.toLowerCase()}`;
  const heuristics = documents.heuristics.map((article) => {
    const {type, value} = article;
    const usages = heuristicUsages.filter((entry) => heuristicKey(entry.type, entry.value) === heuristicKey(type, value));
    return {
      type, value,
      name: article.name,
      description: article.description,
      docUrl: article.docUrl,
      sourceUrl: article.sourceUrl || (type.toLowerCase() === 'cve'
        ? `https://github.com/cradle-lang/cradle-lib-cve/tree/main/${encodeURIComponent(value)}`
        : `https://github.com/cradle-lang/cradle-lib/tree/main/heuristics/${encodeURIComponent(type.toLowerCase())}/${encodeURIComponent(value)}`),
      usages,
      scenarios: libraryScenarios.filter((scenario) => usages.some((usage) => usage.scenario.id === scenario.id)),
    };
  });
  const frameworks = [...new Set(heuristics.map(({type}) => type))].sort();
  return {configurations, heuristicUsages, heuristics, frameworks};
}
