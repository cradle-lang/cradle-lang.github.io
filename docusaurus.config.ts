import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'CRADLE',
  tagline: 'Cyber Experimentation as Code',
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
  url: 'https://cradle-lang.org',
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
          // editUrl:
          //   'https://github.com/cradle-lang/cradle-lang.github.io/tree/main/',
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
          // TODO: Set to false after the first stable documentation version
          // has been created.
          includeCurrentVersion: true,

          lastVersion: 'current',

          versions: {
            current: {
              label: 'Current',
            },
            '1.0.0': {
              label: '1.0.0',
              path: '1.0.0',
              banner: 'none',
            },
          },
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

    algolia: {
      appId: 'WUIVATUVJB',
      apiKey: 'a2a4011346dd4abf6957d9fc6702683b',
      indexName: 'cradle-lang',

      contextualSearch: true,
      searchPagePath: 'search',
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
          to: '/workbench/',
          label: 'Workbench',
          position: 'left',
        },
        {
          to: '/releases/',
          label: 'Releases',
          position: 'left',
        },
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
            {
              label: 'Support',
              to: '/docs/project/support',
            },
            {
              label: 'Acknowledgements',
              to: '/docs/project/acknowledgments',
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
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
