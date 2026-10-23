import documented from '../../data/library.generated.json';
import {scenarios, scenarioSource} from './catalog';
import {parseCradleForWorkbench} from '../workbench/utils/cradleParser';
import {mergeResources} from './resources';
export type {LibraryScenario} from './resources';

export const libraryScenarios = scenarios.map((scenario) => ({
  ...scenario,
  parsed: parseCradleForWorkbench(scenarioSource(scenario)),
}));
export const {configurations, heuristicUsages, heuristics, frameworks} = mergeResources(libraryScenarios, documented);
