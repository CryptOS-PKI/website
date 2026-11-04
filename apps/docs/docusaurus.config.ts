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

import {frameFooter, frameNav, legalHtml, TAGLINE, taglineHtml} from '@cryptos-pki/frame/content';
import {NAV_LINK_CLASS} from '@cryptos-pki/frame/header-menu-config';
import {frameLinks, stripHtml} from '@cryptos-pki/frame/strip';
import {contentWidthBootScript} from '@cryptos-pki/frame/full-width';

import {oldDocsPaths} from './redirects';
import {DOCS_CONSENT_PREFIX} from './src/lib/consent';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Two docs, one site: CryptOS itself at /docs/cryptos (the default docs
// instance: docs/, versioned_docs/, versions.json, sidebars.ts) and FleetOS
// Manager at /docs/fleet (fleet/, fleet_versioned_docs/, fleet_versions.json,
// sidebars-fleet.ts). Each has its own sidebar and is versioned on its own,
// following its own product's release (packages/frame/release.ts): the
// newest cut version is the default, and the pages in docs/ and fleet/ are
// "Next", unreleased main, at /docs/cryptos/next/ and /docs/fleet/next/ under
// a banner that points at the current version. The deploy builds with
// DOCS_INCLUDE_NEXT=false, so the published site has the released versions
// only; every other build (dev, CI, previews) includes Next.
const includeNext = process.env.DOCS_INCLUDE_NEXT !== 'false';

// Docusaurus rejects options for a version it isn't building.
const nextVersion = includeNext
  ? {current: {label: 'Next', path: 'next', banner: 'unreleased' as const}}
  : {};

// The frame and the brand assets come from the shared packages: one copy of
// site-frame.css, the fonts, the header links, the footer, the strip, the
// marks and the favicon for both sites.
const framePackage = '../../packages/frame';
const brandPackage = '../../packages/brand';

// The site's base path, and where the product site lives. A preview build,
// served from a sub-path on someone else's server, sets PREVIEW_BASE_PATH and
// CRYPTOS_SITE_URL (and CRYPTOS_DOCS_URL for the strip's absolute links);
// the real build leaves them unset. Asset paths written into raw HTML below
// (the footer's marks) are built from the base path, since Docusaurus only
// rewrites the paths it renders itself.
const baseUrl = process.env.PREVIEW_BASE_PATH || '/';
const links = frameLinks({
  siteUrl: process.env.CRYPTOS_SITE_URL || 'https://www.cryptos-pki.com',
  docsUrl: process.env.CRYPTOS_DOCS_URL || 'https://docs.cryptos-pki.com',
});
const footer = frameFooter(links);

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
  // The product tagline, a trademark, so it carries ™ (packages/frame).
  tagline: `${TAGLINE}\u2122.`,
  favicon: 'favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.cryptos-pki.com',
  baseUrl,

  // Read by the docs home's link back to the product site.
  customFields: {
    siteUrl: `${links.site}/`,
  },

  organizationName: 'CryptOS-PKI',
  projectName: 'website',

  // static/ holds the docs' own images; /fonts/ comes from packages/frame and
  // /favicon.svg and /img/brand/ from packages/brand.
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

  // The fonts the strip, header and footer draw with, preloaded the same way
  // on the site (apps/site/app/root.tsx), so the frame never paints in a
  // fallback face first.
  headTags: [
    ...['inter-latin.woff2', 'jetbrains-mono-700-latin.woff2'].map((font) => ({
      tagName: 'link',
      attributes: {rel: 'preload', href: `${baseUrl}fonts/${font}`, as: 'font', type: 'font/woff2', crossorigin: 'anonymous'},
    })),
    // A remembered full-width choice (only stored once the visitor accepts
    // the cookie choice) goes on <html> before the first paint, so the
    // content column doesn't jump when the app loads.
    {tagName: 'script', attributes: {}, innerHTML: contentWidthBootScript(DOCS_CONSENT_PREFIX)},
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs/cryptos',
          sidebarPath: './sidebars.ts',
          includeCurrentVersion: includeNext,
          versions: nextVersion,
        },
        blog: false,
        theme: {
          customCss: [`${framePackage}/site-frame.css`, './src/css/theme.css', './src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'fleet',
        path: 'fleet',
        routeBasePath: 'docs/fleet',
        sidebarPath: './sidebars-fleet.ts',
        includeCurrentVersion: includeNext,
        versions: nextVersion,
      },
    ],
    // Before the split every page lived at /docs/<page> and /docs/next/<page>.
    // Each page answers at its old paths too (redirects.ts), so links already
    // out there, the console's help links among them, keep working.
    ['@docusaurus/plugin-client-redirects', {createRedirects: oldDocsPaths}],
  ],

  themeConfig: {
    // Dark first, as on the site and in the Fleet Manager UI. The header
    // shows the shared switch from packages/frame (the 'custom-themeToggle'
    // item below) at the spot the site shows it. The built-in switch stays
    // enabled but hidden (custom.css): with disableSwitch, Docusaurus ignores
    // the stored choice, and a reload would fall back to dark.
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    // The strip above the header: the same markup the site renders
    // (packages/frame/strip.ts), drawn by site-frame.css. Its band comes from
    // custom.css, so no colours are set here.
    announcementBar: {
      id: 'release-strip',
      content: stripHtml(links),
      isCloseable: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    // The header mirrors the site's (apps/site/app/components/nav.tsx): the
    // same mark, wordmark and links in the same order (packages/frame
    // content.ts), then the theme switch. Site links open in the same tab, as
    // they do there, and the mark goes to the site's home. The docs sections
    // (Get Started, Concepts, Use Cases, Install, Using, Reference) live in
    // the sidebar and on the docs home, not in the header.
    navbar: {
      // custom.css appends the "OS" in the primary colour, as in the wordmark.
      title: 'Crypt',
      logo: {
        alt: '',
        href: `${links.site}/`,
        target: '_self',
        src: 'img/brand/cryptos-mark-light.svg',
        srcDark: 'img/brand/cryptos-mark-dark.svg',
        width: 28,
        height: 28,
      },
      items: [
        // The version picker sits right after the wordmark, where the site's
        // header shows nothing, so the rest of the header lines up with the
        // site's to the pixel. It shows on doc pages only, so the docs home's
        // header matches the site's home exactly.
        // One picker per docs, each showing only on its own pages.
        ...['default', 'fleet'].map((docsPluginId) => ({
          type: 'custom-docsVersion',
          docsPluginId,
          position: 'left' as const,
          className: 'navbar__version',
          dropdownActiveClassDisabled: true,
        })),
        // The full-width switch, beside the picker on doc pages only.
        {type: 'custom-fullWidth', position: 'left'},
        ...frameNav(links).map((link) =>
          link.label === 'Docs'
            ? {to: '/', label: link.label, activeBaseRegex: '^/', position: 'right' as const, className: NAV_LINK_CLASS}
                        // html, not label: a label on an off-site href gets Docusaurus's
            // external-link icon, which the site's header doesn't have.
            : {href: link.href, html: link.label, target: '_self', position: 'right' as const, className: NAV_LINK_CLASS},
        ),
        {type: 'custom-themeToggle', position: 'right'},
        // Under the frame's breakpoint the links above hide (NAV_LINK_CLASS)
        // and this shared menu button shows after the switch, as on the site.
        {type: 'custom-headerMenu', position: 'right', links: frameNav(links)},
      ],
    },
    // The footer mirrors the site's (apps/site/app/components/footer.tsx): the
    // brand and tagline, the same three link groups, then the same legal line,
    // all from packages/frame content.ts.
    footer: {
      links: [
        {
          title: null,
          items: [
            {
              html:
                '<div class="footer__brand"><a class="footer__name" href="' +
                `${links.site}/` +
                '" aria-label="CryptOS">' +
                `<img class="footer__mark mark--light" src="${baseUrl}img/brand/cryptos-mark-light.svg" width="24" height="24" alt="" />` +
                `<img class="footer__mark mark--dark" src="${baseUrl}img/brand/cryptos-mark-dark.svg" width="24" height="24" alt="" />` +
                '<span class="footer__wordmark">Crypt<span class="footer__wordmark-accent">OS</span></span></a>' +
                `<p class="footer__tagline">${taglineHtml}</p></div>`,
            },
          ],
        },
        ...footer.groups.map((group) => ({
          title: group.title,
          items: group.links.map((link) =>
            link.label === 'Docs' ? {label: link.label, to: '/'} : {label: link.label, href: link.href, target: '_self'},
          ),
        })),
      ],
      copyright: legalHtml(footer.marks, new Date().getFullYear()),
    },
    prism: {
      theme: prismLight,
      darkTheme: prismDark,
      additionalLanguages: ['bash', 'go', 'yaml', 'json', 'protobuf', 'ini'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
