import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Cradle',
  tagline: 'CRADLE Documentation',
  favicon: 'img/cradle-favicon.svg',
  
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
  },

  // Set the production url of your site here
  url: 'https://cradle-lang.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cradle-lang', // Usually your GitHub org/user name.
  projectName: 'cradle-lang.github.io', // Usually your repo name.

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
            'https://github.com/cradle-lang/cradle-lang.github.io/tree/main/',
                      /*
           * There is no published CRADLE documentation version yet.
           *
           * The current docs/ directory therefore remains the default
           * documentation served at /docs/.
           *
           * Once the first stable release is created, we will configure:
           *
           * lastVersion: '1.0.0',
           *
           * versions: {
           *   current: {
           *     label: 'Next',
           *     path: 'next',
           *     banner: 'unreleased',
           *   },
           *
           *   '1.0.0': {
           *     label: '1.0.0',
           *     path: '',
           *     banner: 'none',
           *   },
           * },
           */
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
          to: '/releases/',
          label: 'Releases',
          position: 'left',
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
