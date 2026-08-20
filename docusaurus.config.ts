import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Cradle',
  tagline: 'CRADLE Documentation',
  favicon: 'img/cradle-favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://cradle-dsl.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cradle-dsl', // Usually your GitHub org/user name.
  projectName: 'cradle-dsl.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './config/sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/cradle-dsl/cradle-dsl.github.io/tree/main/',
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   feedOptions: {
        //     type: ['rss', 'atom'],
        //     xslt: true,
        //   },
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        //   // Useful options to enforce blogging best practices
        //   onInlineTags: 'warn',
        //   onInlineAuthors: 'warn',
        //   onUntruncatedBlogPosts: 'warn',
        // },
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
    navbar: {
      title: 'CRADLE',

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
          href: 'https://github.com/cradle-dsl',
          label: 'GitHub',
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
              to: '/docs/user-guide/write-scenario',
            },
            {
              label: 'Language',
              to: '/docs/il-language/',
            },
            {
              label: 'Reference',
              to: '/docs/reference/command-reference',
            },
          ],
        },

        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/cradle-dsl',
            },
            {
              label: 'Release Notes',
              to: '/docs/project/release-notes',
            },
            {
              label: 'Acknowledgements',
              to: '/docs/project/acknowledgments',
            },
            {
              label: 'Support',
              to: '/docs/project/support',
            },
          ],
        },
      ],

      copyright:
        `Copyright © ${new Date().getFullYear()} CRADLE.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
