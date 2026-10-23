import { themes as prismThemes } from 'prism-react-renderer';
import path from 'node:path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'CRADLE',
  tagline: 'Cyber Experimentation as Code',
  favicon: 'img/cradle-favicon.png',

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'algolia-site-verification',
        content: 'DADEE7CC0A51CF7D',
      },
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    // Use Webpack until the Rspack development-server panic is resolved.
    faster: false,
  },

  // Set the production url of your site here
  url: 'https://cradle-lang.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cradle-lang', // Usually your GitHub org/user name.
  projectName: 'cradle-lang.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',

  markdown: {
    format: 'detect',
    async parseFrontMatter(params) {
      const result = await params.defaultParseFrontMatter(params);
      const libraryPath = path.relative(path.resolve(__dirname, 'library'), params.filePath);
      if (!libraryPath.startsWith('..') && !path.isAbsolute(libraryPath) &&
          /^(scenarios|configurations|heuristics)\/[a-z0-9-]+\/index\.mdx?$/.test(libraryPath)) {
        result.frontMatter.slug = `/${path.dirname(libraryPath)}`;
      }
      const relativePath = path.relative(path.resolve(__dirname, 'blog'), params.filePath);
      const isBlogPost = !path.isAbsolute(relativePath) &&
        !relativePath.startsWith('..') && /\.mdx?$/.test(relativePath) &&
        !relativePath.split(path.sep).some((part) => part.startsWith('_')) &&
        path.basename(relativePath) !== 'README.md';

      if (isBlogPost) {
        const {tags} = result.frontMatter;
        const validTag = (tag: unknown) => typeof tag === 'string'
          ? tag.trim().length > 0
          : Boolean(tag && typeof tag === 'object' && 'label' in tag &&
            typeof tag.label === 'string' && tag.label.trim().length > 0);
        if (!Array.isArray(tags) || tags.length === 0 || !tags.every(validTag)) {
          throw new Error(`Blog post ${relativePath} must include at least one non-empty tag. Add front matter such as tags: [project].`);
        }
      }
      return result;
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    './plugins/library/index.cjs',
    ['@docusaurus/plugin-content-docs', {
      id: 'library',
      path: 'library',
      routeBasePath: 'library',
      sidebarPath: false,
      include: ['scenarios/*/index.{md,mdx}', 'configurations/*/index.{md,mdx}', 'heuristics/*/index.{md,mdx}'],
      exclude: ['**/_*/**'],
      onInlineTags: 'ignore',
    }],
    function cradleSources() {
      return {
        name: 'cradle-sources',
        configureWebpack(_config, isServer) {
          return {module: {rules: [{test: /\.cradle$/, oneOf: [
            {resourceQuery: /raw/, type: 'asset/source'},
            {type: 'javascript/auto', use: [{loader: 'file-loader', options: {
              name: 'assets/files/[name]-[contenthash].[ext]', emitFile: !isServer,
            }}]},
          ]}]}};
        },
      };
    },
    function blogSearchIndex() {
      return {
        name: 'blog-search-index',
        async allContentLoaded({allContent, actions}) {
          const blog = allContent['docusaurus-plugin-content-blog']?.default as
            {blogPosts?: {metadata: {unlisted?: boolean}}[]} | undefined;
          actions.setGlobalData({
            posts: (blog?.blogPosts ?? [])
              .filter(({metadata}) => !metadata.unlisted)
              .map(({metadata}) => metadata),
          });
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './config/sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/cradle-lang/cradle-lang.github.io/tree/main/',

          /*
           * The docs/ directory remains the current documentation at /docs/.
           * Published snapshots are served from their versioned routes.
           */
          includeCurrentVersion: true,
          lastVersion: 'current',

          versions: {
            current: {
              label: 'Current',
            },
          },
        },
        blog: {
          blogTitle: 'CRADLE Blog',
          blogDescription: 'Project updates, practical guides and research perspectives from CRADLE.',
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 10,
          sortPosts: 'descending',
          postsPerPage: 10,
          showReadingTime: true,
          // Contributors can introduce topics directly in post front matter.
          onInlineTags: 'ignore',
          exclude: ['**/_*', '**/_*/**', '**/README.md'],
          feedOptions: {
            type: [],
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // themeConfig: {
  //   // Replace with your project's social card
  //   image: 'img/docusaurus-social-card.jpg',
  //   colorMode: {
  //     respectPrefersColorScheme: true,
  //   },
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    algolia: {
      appId: 'WUIVATUVJB',
      apiKey: 'a2a4011346dd4abf6957d9fc6702683b',
      indexName: 'cradle-lang',

      contextualSearch: true,
      searchPagePath: 'search',
    },

    navbar: {
      title: 'CRADLE',
      logo: {
        alt: 'CRADLE logo',
        src: 'img/cradle-favicon.png',
        width: 32,
        height: 32,
      },

      items: [
        {
          to: '/docs/getting-started/quick-start',
          label: 'Get Started',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/collection/',
          label: 'Library',
          activeBaseRegex: '/(collection|library)(/|$)',
          position: 'left',
        },
        {
          to: '/workbench/',
          label: 'Workbench',
          position: 'left',
        },
        {
          to: '/releases/',
          label: 'Releases',
          position: 'left',
        },
        // Uncomment when the blog is ready to appear in navigation.
        // {
        //   to: '/blog/',
        //   label: 'Blog',
        //   position: 'left',
        // },
        {
          type: 'custom-version-dropdown',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',

      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/quick-start',
            },
            {
              label: 'User Guide',
              to: '/docs/guides/write-a-scenario',
            },
            {
              label: 'Language',
              to: '/docs/language/overview',
            },
            {
              label: 'Reference',
              to: '/docs/cli/command-reference',
            },
          ],
        },

        {
          title: 'Project',
          items: [
            {
              label: 'Releases',
              to: '/releases/',
            },
            // Uncomment alongside the Blog navbar entry above.
            // {
            //   label: 'Blog',
            //   to: '/blog/',
            // },
            {
              label: 'Support and Feedback',
              to: '/docs/project/support',
            },
            {
              label: 'Research and References',
              to: '/docs/project/references',
            },
            {
              label: 'Acknowledgements',
              to: '/docs/project/acknowledgments',
            },
            {
              label: 'Report a Website Issue',
              href: 'https://github.com/cradle-lang/cradle-lang.github.io/issues',
            },
          ],
        },

        {
          title: 'Legal',
          items: [
            {
              label: 'Legal Notices',
              to: '/docs/project/legal-notices',
            },
            {
              label: 'Copyright',
              to: '/docs/project/COPYRIGHT',
            },
            {
              label: 'Licence',
              to: '/docs/project/LICENCE',
            },
          ],
        },
      ],

      copyright:
        `Copyright © ${new Date().getFullYear()} National Cybersecurity R&D Lab (NCL). All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'yaml', 'go', 'bash', 'powershell', 'c', 'java'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
