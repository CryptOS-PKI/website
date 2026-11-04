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

- 📝 **`docs/`:** Next, the pages for unreleased `main`. Sidebar order lives in `sidebars.ts`.
- 🗂️ **`versioned_docs/`, `versioned_sidebars/`, `versions.json`:** one snapshot per released
  version, cut by `npm run docs:version` from the root. A snapshot is never edited by hand.
- 🏠 **`src/pages/index.tsx`:** the docs home.
- 🎨 **`src/css/theme.css`:** the page theme, taken from the Fleet Manager web UI
  ([`cryptos-web`](https://github.com/CryptOS-PKI/cryptos-web), `apps/console/src/index.css`):
  the web UI's palette as `--cryptos-*` custom properties mapped onto Docusaurus's Infima
  variables. Change a colour in the web UI first, then mirror it here. Page-level tweaks go in
  `src/css/custom.css`.
- 🧭 **Header, strip and footer:** the product site's, from `packages/frame`: the links, footer
  and strip markup in `content.ts` and `strip.ts`, the measurements and colours in
  `site-frame.css`, mapped onto Docusaurus's classes in `src/css/custom.css`. The theme switch is
  the shared one (`src/components/theme-toggle-navbar-item.tsx`), and the version picker shows on
  doc pages only (`src/components/docs-version-navbar-item.tsx`).
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
