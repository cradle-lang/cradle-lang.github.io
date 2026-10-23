import library from '../../data/library.generated.json';

export type Scenario = {
  id: string;
  name: string;
  source: string;
  category: string;
  description: string;
  file: string;
  tags: string[];
  artwork: string;
  thumbnailPath?: string;
  thumbnailAlt?: string;
  requirements: string;
  spec: string;
  sourcePath: string;
  docPath: string;
  docUrl: string;
};

export const scenarios: Scenario[] = library.scenarios;
export function scenarioSource(scenario: Scenario): string {
  return scenario.spec;
}
export const collectionRepository = 'https://github.com/cradle-lang/cradle-lang.github.io';
export const validationWorkflow = `${collectionRepository}/actions/workflows/validate-scenario.yml`;

export function findScenario(id: string | null): Scenario | undefined {
  return scenarios.find((scenario) => scenario.id === id);
}
