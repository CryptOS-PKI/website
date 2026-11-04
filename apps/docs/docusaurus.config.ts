/*
Copyright The CryptOS Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Versioned docs. Each release's snapshot lives in versioned_docs/ and is
// listed in versions.json; the newest one is the default at /docs/. The pages
// in docs/ are "Next", unreleased main, served at /docs/next/ under a banner
// that points at the current version. The deploy builds with
// DOCS_INCLUDE_NEXT=false, so the published site has the released versions
// only; every other build (dev, CI, previews) includes Next.
const includeNext = process.env.DOCS_INCLUDE_NEXT !== 'false';

// The fonts and the brand assets come from the shared packages: one copy of
// site-frame.css, the fonts, the marks and the touch icon for both sites.
const framePackage = '../../packages/frame';
const brandPackage = '../../packages/brand';

// Code blocks sit on the web card colour. On those backgrounds every token of
// these two themes meets WCAG AA except vsLight's pure red attribute names
// (4.0:1), which take the web palette's destructive red (4.8:1) instead.
const prismLight = {
  ...prismThemes.vsLight,
  plain: {...prismThemes.vsLight.plain, backgroundColor: '#ffffff'},
  styles: prismThemes.vsLight.styles.map((entry) =>
    entry.style.color === 'rgb(255, 0, 0)' ? {...entry, style: {...entry.style, color: '#dc2626'}} : entry,
  ),
};
const prismDark = {
  ...prismThemes.oceanicNext,
  plain: {...prismThemes.oceanicNext.plain, backgroundColor: '#141925'},
};

const config: Config = {
  title: 'CryptOS',
  tagline: 'An immutable, API-driven certificate authority operating system',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.cryptos-pki.com',
  baseUrl: '/',

  organizationName: 'CryptOS-PKI',
  projectName: 'website',

  // static/ holds the docs' own images; /fonts/ comes from packages/frame and
  // /img/brand/ from packages/brand.
  staticDirectories: ['static', `${framePackage}/public`, `${brandPackage}/public`],

  // A broken internal link fails the build, in Next and in every released
  // version, so CI catches it before a release does.
  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          includeCurrentVersion: includeNext,
          // Docusaurus rejects options for a version it isn't building.
          versions: includeNext ? {current: {label: 'Next', path: 'next', banner: 'unreleased'}} : {},
        },
        blog: false,
        theme: {
          customCss: [`${framePackage}/site-frame.css`, './src/css/theme.css', './src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Dark first, as in the Fleet Manager UI; the navbar toggle switches it.
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    announcementBar: {
      id: 'pre-1-0',
      content:
        'CryptOS is pre-1.0: until v1.0.0, any release may change fundamentally. ' +
        '<a href="/docs/introduction/status-roadmap">Read this before you run it in production</a>.',
      backgroundColor: 'var(--cryptos-warning)',
      textColor: 'var(--cryptos-warning-foreground)',
      isCloseable: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      // theme.css appends the "OS" in the primary colour, as in the web wordmark.
      title: 'Crypt',
      logo: {
        alt: 'CryptOS',
        src: 'img/brand/cryptos-mark-light.svg',
        srcDark: 'img/brand/cryptos-mark-dark.svg',
        width: 28,
        height: 28,
      },
      items: [
        // Every page shares one sidebar, so doc-type items would all mark
        // themselves active; match each item on its own section path instead.
        {
          to: '/docs',
          label: 'Get Started',
          position: 'left',
          activeBaseRegex: '^/docs/?$|^/docs/introduction/',
        },
        {to: '/docs/concepts/certificates-101', label: 'Concepts', position: 'left', activeBasePath: '/docs/concepts'},
        {to: '/docs/use-cases/overview', label: 'Use Cases', position: 'left', activeBasePath: '/docs/use-cases'},
        {
          to: '/docs/install-deploy/build-bootable-image',
          label: 'Install',
          position: 'left',
          activeBasePath: '/docs/install-deploy',
        },
        {to: '/docs/using/setup', label: 'Using', position: 'left', activeBasePath: '/docs/using'},
        {
          to: '/docs/reference/machine-config',
          label: 'Reference',
          position: 'left',
          activeBasePath: '/docs/reference',
        },
        {
          href: 'https://www.cryptos-pki.com',
          label: 'cryptos-pki.com',
          position: 'right',
        },
        {
          href: 'https://github.com/CryptOS-PKI',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'What is CryptOS?', to: '/docs'},
            {label: 'Try it locally', to: '/docs/try-it-locally/requirements'},
            {label: 'Reference', to: '/docs/reference/machine-config'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Product overview', href: 'https://www.cryptos-pki.com'},
            {label: 'cryptos-node (OS/engine)', href: 'https://github.com/CryptOS-PKI/cryptos-node'},
            {label: 'cryptos-manager (Fleet Manager)', href: 'https://github.com/CryptOS-PKI/cryptos-manager'},
          ],
        },
      ],
      // CNCF convention: copyright to the project authors, never a company
      // (cncf/foundation copyright-notices.md). The LF Projects trademark lines
      // from the CNCF website guidelines apply only once the project is accepted.
      copyright:
        'Copyright © The CryptOS Authors<br />' +
        'Documentation licensed under the <a href="https://github.com/CryptOS-PKI/website/blob/main/LICENSE">Apache License 2.0</a>',
    },
    prism: {
      theme: prismLight,
      darkTheme: prismDark,
      additionalLanguages: ['bash', 'go', 'yaml', 'json', 'protobuf', 'ini'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
