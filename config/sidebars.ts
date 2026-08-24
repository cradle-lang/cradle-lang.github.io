import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {type: 'doc', id: 'index', label: 'Documentation Home'},
    {type: 'category', label: 'Overview', collapsed: false, items: ['overview/what-is-cradle', 'overview/architecture-at-a-glance']},
    {type: 'category', label: 'Getting Started', collapsed: false, items: ['getting-started/quick-start', 'getting-started/install-cradlexc', 'getting-started/first-scenario', 'getting-started/validate-and-compile', 'getting-started/inspect-output', 'getting-started/use-a-backend']},
    {type: 'category', label: 'Guides', items: ['guides/write-a-scenario', 'guides/configuration', 'guides/artifact-repositories', 'guides/forensic-data', {type: 'category', label: 'Backends', items: ['guides/backends/overview', 'guides/backends/generate-target-files']}, {type: 'category', label: 'Import and Migration', items: ['guides/import/import-existing', 'guides/import/migrate-v1']}, 'guides/troubleshooting']},
    {type: 'category', label: 'CRADLE Language', items: ['language/overview', 'language/syntax-and-types', 'language/metadata', 'language/instances-and-roles', 'language/networks-and-routing', 'language/events-and-dependencies', 'language/objects-and-interpolation', 'language/includes', 'language/heuristics', 'language/diagnostics']},
    {type: 'category', label: 'CLI Reference', items: ['cli/overview', 'cli/command-reference', 'cli/configuration', 'cli/backend-discovery', 'cli/outputs', 'cli/exit-codes']},
    {type: 'category', label: 'Examples', items: ['examples/hello-world', 'examples/networking', 'examples/event-dependencies', 'examples/backend-example']},
    {type: 'category', label: 'Developer', items: [{type: 'category', label: 'Compiler Internals', items: ['internals/compiler-pipeline', 'internals/ast', 'internals/hir', 'internals/deployment-ir']}, {type: 'category', label: 'Backend Development', items: ['backend-development/overview', 'backend-development/plugin-model', 'backend-development/plugin-protocol', 'backend-development/deployment-ir-contract', 'backend-development/building-a-backend']}, 'schema/cradle-schema']},
    {type: 'category', label: 'Project', items: ['project/business-case', 'project/release-notes', 'project/support', 'project/legal-notices', 'project/acknowledgments', 'project/references']},
  ],
};

export default sidebars;
