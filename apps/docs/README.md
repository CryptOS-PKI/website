# CryptOS docs 📚

> 📖 The CryptOS documentation site, docs.cryptos-pki.com: how to build, install and run CryptOS, written to be readable by everyone

Docusaurus 3 and TypeScript, one app in this repo's npm workspaces. Run the commands below from
the repo root; see the root [README](../../README.md) for the rest.

```bash
npm run dev:docs                        # http://localhost:3000, Next included
npm run build -w @cryptos-pki/docs      # the static site in apps/docs/build
npm run typecheck -w @cryptos-pki/docs
```

## ✨ What is where

- 📝 **Two docs, one site:** CryptOS at `/docs/cryptos` (`docs/`, sidebar in `sidebars.ts`) and
  FleetOS Manager at `/docs/fleet` (`fleet/`, sidebar in `sidebars-fleet.ts`), each with its own
  sidebar, versions and version picker. `docs/` and `fleet/` are Next, the pages for unreleased
  `main`. A link to the other docs is an absolute path, such as `/docs/fleet/helm`.
- 🗂️ **Snapshots:** `versioned_docs/`, `versioned_sidebars/` and `versions.json` for CryptOS;
  `fleet_versioned_docs/`, `fleet_versioned_sidebars/` and `fleet_versions.json` for FleetOS
  Manager. One snapshot per released version, cut by `npm run docs:version` from the root. A
  snapshot is never edited by hand.
- ↪️ **`redirects.ts`:** every page also answers at its path from before the split
  (`/docs/<page>`, `/docs/next/<page>`), through `@docusaurus/plugin-client-redirects`.
- 🏠 **`src/pages/index.tsx`:** the docs home.
- 🎨 **`src/css/theme.css`:** the page theme, taken from the Fleet Manager web UI
  ([`cryptos-web`](https://github.com/CryptOS-PKI/cryptos-web), `apps/console/src/index.css`):
  the web UI's palette as `--cryptos-*` custom properties mapped onto Docusaurus's Infima
  variables. Change a colour in the web UI first, then mirror it here. Page-level tweaks go in
  `src/css/custom.css`.
- 🧭 **Header, strip and footer:** the product site's, from `packages/frame`: the links, footer
  and strip markup in `content.ts` and `strip.ts`, the measurements and colours in
  `site-frame.css`, mapped onto Docusaurus's classes in `src/css/custom.css`. The theme switch is
  the shared one (`src/components/theme-toggle-navbar-item.tsx`). The header is the site's, item
  for item, at every width.
- 🧰 **Doc toolbar:** at the right end of the breadcrumb line (`src/theme/DocBreadcrumbs`,
  `src/components/doc-toolbar.tsx`): the version picker for the page's own docs, and a switch that
  widens the content column to the window (the frame stays put; off by default, shown only above
  the frame width). On a narrow screen it wraps under the breadcrumbs.
- 🍪 **Consent first:** the theme and the content width are remembered on the machine only after
  the visitor accepts the cookie choice, which shows the first time they use either switch
  (`src/theme/Root.tsx`). Until then the theme follows the system setting, the theme switch only
  opens the cookie bar, and nothing is written to browser storage:
  Docusaurus's own switch, announcement bar (`src/theme/AnnouncementBar` draws the strip instead),
  version memory and tab memory (`src/theme/Tabs`) are kept out of storage. The pieces live in
  `packages/frame` (see its README); `npm run check:storage:docs` checks a build.
- 🏷️ **Plain navigation:** the sidebar and the table of contents show titles and headings without
  their emoji (`src/theme/DocSidebarItems`, `src/theme/TOCItems`); the pages keep them.
- 🔤 **Fonts and marks:** Inter and JetBrains Mono come from `packages/frame`, the marks and the
  favicon from `packages/brand`, both through `staticDirectories`.

## 🧭 Conventions

- ✅ **Every page states its status:** Works today, In flight, or Roadmap.
- 📖 **Docs describe CryptOS as shipped on `main`**, not design intent. Where a design note and the
  code disagree, the code wins.
- ♿ **Contrast:** body text, links, callouts, tabs, tables, code tokens and the sidebar meet WCAG
  AA in both modes. Check any new colour against its real background before adding it.
- 🔗 **Links:** a broken internal link fails the build, in Next and in every released version.
- 🏷️ **MDX 3:** no explicit `{#id}` heading anchors; rely on the generated slugs.
