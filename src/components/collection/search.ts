type SearchableScenario = {
  id: string;
  name: string;
  description: string;
  source: string;
  category: string;
  tags: string[];
  searchText?: string;
};

export function matchesScenarioSearch(scenario: SearchableScenario, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  const text = normalize(scenario.searchText ?? [scenario.id, scenario.name, scenario.description, scenario.source, scenario.category, ...scenario.tags].join(' '));
  return normalize(query).split(' ').filter(Boolean).every(term => text.includes(term));
}
