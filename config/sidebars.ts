import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Documentation Home',
    },

    {
      type: 'category',
      label: 'Overview',
      collapsed: false,
      items: [
        'overview/what-is-cradle',
        'overview/architecture-at-a-glance',
      ],
    },

    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/install-cradlexc',
        'getting-started/first-scenario',
        'getting-started/validate-and-compile',
        'getting-started/inspect-output',
        'getting-started/use-a-backend',
      ],
    },

    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/write-a-scenario',
        'guides/configuration',
        'guides/artifact-repositories',
        'guides/forensic-data',
        {
          type: 'category',
          label: 'Backends',
          items: [
            'guides/backends/overview',
            'guides/backends/generate-target-files',
          ],
        },
        'guides/troubleshooting',
      ],
    },

    {
      type: 'category',
      label: 'CRADLE Language',
      items: [
        'language/overview',
        'language/syntax-and-types',
        'language/metadata',
        'language/instances-and-roles',
        'language/networks-and-routing',
        'language/events-and-dependencies',
        'language/objects-and-interpolation',
        'language/includes',
        'language/heuristics',
        'language/diagnostics',
      ],
    },

    {
      type: 'category',
      label: 'CLI Reference',
      items: [
        'cli/overview',
        'cli/command-reference',
        'cli/configuration',
        'cli/backend-discovery',
        'cli/outputs',
        'cli/exit-codes',
      ],
    },

    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/hello-world',
        'examples/networking',
        'examples/event-dependencies',
        'examples/backend-example',
      ],
    },

    {
      type: 'category',
      label: 'Project',
      items: [
        'project/business-case',
        'project/support',
        'project/acknowledgments',
        'project/references',
        {
          type: 'category',
          label: 'Legal',
          items: [
            'project/legal-notices',
            'project/COPYRIGHT',
            'project/LICENCE',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
