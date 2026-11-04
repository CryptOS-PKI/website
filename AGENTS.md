# AGENTS.md - website

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

Two static sites in one repo, as npm workspaces:

- `apps/site` (`@cryptos-pki/site`): the CryptOS product site (www.cryptos-pki.com), a marketing
  site, not an app: the home page and `/releases`, the current release's downloads. React Router
  v7 in framework mode prerenders it to static HTML at build time (`ssr: false` plus a
  `prerender()` list in `react-router.config.ts`); there is no Node server at request time, and
  nothing talks to a backend. The page copy lives in `app/content/cryptos.ts` and the downloads
  in `app/content/release.ts`; the components they feed (`app/components/`) take their content
  as props. No emoji on the site.
- `apps/docs` (`@cryptos-pki/docs`): the CryptOS docs (docs.cryptos-pki.com), Docusaurus 3,
  versioned. `docs/` is Next (unreleased `main`); `versioned_docs/` holds one snapshot per
  release.
- `packages/frame` (`@cryptos-pki/frame`): the frame both sites share. `site-frame.css` holds the
  font faces, the frame tokens (column, header, strip and footer measurements) and the frame
  colours, light and dark; `strip.ts` the strip above the header; `content.ts` the header links,
  the footer and the legal line; `hero.tsx` the hero both homes open with, its copy in
  `hero-content.ts` and its rules in `hero.css`; `theme-toggle.tsx` the light and dark switch;
  `release.ts` the current product release; `public/fonts/` the self-hosted fonts.
- `packages/brand` (`@cryptos-pki/brand`): the marks, favicon and touch icon in `public/`.
- `vendor/cryptos-ui` (`@cryptos-pki/ui`): a vendored, read-only copy of cryptos-web's
  `packages/ui` kit (see `vendor/cryptos-ui/NOTICE`). The site depends on it as a `file:` link; it is not a workspace,
  so its own tests and devDependencies never install here. Not linted, typechecked or formatted
  here; update it by re-copying from cryptos-web, never by editing it in place.
- `scripts/`: the CI path filter (`changed-apps.mjs`) and the docs version scripts, with tests.

Both apps serve `packages/frame/public` and `packages/brand/public` from their site root: the
site through the `sharedPublic` Vite plugin (`apps/site/shared-public.ts`), the docs through
`staticDirectories`. So `/fonts/`, `/img/brand/` and `/favicon.svg` are the same files on both.

## Build, test, lint

Run from the repo root.

- Install: `npm ci --ignore-scripts`
- Lint: `npm run lint` (one root `eslint.config.mjs`; Prettier applies outside `apps/docs`)
- Test: `npm test` (`packages/frame`, `packages/brand`, the site's content and `scripts/` tests)
- Typecheck: `npm run typecheck`
- Build: `npm run build` (or `build:site`, `build:docs`)
- Site link check (after a build): `npm run check:links`
- Font check for a sub-path build: `PREVIEW_BASE_PATH=/sub/ npm run build:site`, then
  `npm run check:fonts -- apps/site/build/client /sub/` (the docs the same way with
  `-- --out-dir build-sub-path`). CI runs both.
- Docs version check: `npm run check:docs-version`; cut one: `npm run docs:version`
- License headers: `task license` (verify) / `task license:fix` (inject)

## The shared frame

- The strip, header and footer must match pixel for pixel on both sites. Change a measurement or
  colour in `packages/frame/site-frame.css`, a link or label in `packages/frame/content.ts`, never
  in one app. The site lays the frame out in `apps/site/app/components/marketing.css`, the docs in
  `apps/docs/src/css/custom.css` on Docusaurus's navbar and footer classes, both from the
  `--frame-*` tokens.
- Both homes open with the same hero (`packages/frame/hero.tsx`): change its copy in
  `hero-content.ts`, never in one app. Each site passes only its calls to action; the docs home
  adds the line saying who the docs are for.
- The downloads live on the site's Releases page (`/releases`), which the header and the strip
  link; the footer carries no download or release links.
- Links in body text look the same on both sites: `site-frame.css` styles unclassed links inside
  `.frame-prose` (the site's `<main>` and the docs home's) and the docs' `.markdown` with
  `--frame-link` (AA on the page and card, light and dark) and an underline. Give every new
  page's `<main>` the `frame-prose` class.
- Every site route builds its `meta` with `pageMeta` (`apps/site/app/content/meta.ts`): titles as
  "Page · CryptOS" (the home page "CryptOS — tagline"), Open Graph and a large Twitter card with
  absolute URLs, and the link-preview card `packages/brand/public/img/brand/og-card.png`, made
  from `packages/brand/og-card.html`. A test fails if a route doesn't.
- The fonts load from the site's base path: `packages/frame/fonts.ts` writes the font faces with
  the base and each site puts them in its `<head>`. Never put a `url("/fonts/...")` in
  `site-frame.css`; a test and the sub-path font check fail on it.
- Dark is the default on both. The site keeps the choice in localStorage `theme` and puts it on
  `<html>` as the kit's `dark` class and `data-theme`; the docs use Docusaurus's colour mode with
  its built-in switch off. Both draw the shared `ThemeToggle`.
- Under 1168px both headers fold their links into the shared menu button
  (`packages/frame/header-menu.tsx`), after the theme switch. The width is one media rule in
  `site-frame.css` and `HEADER_MENU_BREAKPOINT` in `header-menu-config.ts`; `frame.test.ts` keeps
  them in step and fails if either app sets a header breakpoint of its own. Each site marks its
  header links with `NAV_LINK_CLASS`. Re-measure the breakpoint when a header link is added.
- The docs header carries the site's links; the docs sections live in the sidebar and on the docs
  home. The version picker sits right after the wordmark, on doc pages only.
- Cross-site links come from `VITE_DOCS_URL` (site) and `CRYPTOS_SITE_URL` / `CRYPTOS_DOCS_URL`
  (docs), defaulting to the live addresses; `PREVIEW_BASE_PATH` builds either app under a sub-path.

## Docs versions

- The newest entry in `apps/docs/versions.json` is the default at `/docs/`. Next sits at
  `/docs/next/` with the unreleased banner, in every build except the deploy
  (`DOCS_INCLUDE_NEXT=false`).
- A release bumps `packages/frame/release.ts` and runs `npm run docs:version` in its own PR. The
  deploy fails closed unless that version is cut and newest.
- Never edit a snapshot under `versioned_docs/`. Fix the page in `docs/` (Next) instead.

## Logging

Follow the logging rules in `CLAUDE.md`. In short:

- Log generously: entry and exit of significant operations, decisions and branches, retries, state
  changes, external calls (target, duration, outcome), and every error with its context.
- Levels: `trace` for step-by-step detail, `debug` for flow, `info` for lifecycle, `warn` and
  `error` for problems. The environment filters the volume, so err on the side of too much.
- Never log secrets, tokens, or personal data, not even at `trace`. Log an opaque or keyed ID.

## Conventions and gotchas

- See `CLAUDE.md` for the branch/commit/PR rules; they are enforced by the git hooks in
  `.claude/hooks` (run `bash .claude/hooks/install.sh` once per clone).
- Open every PR as a draft. CI skips drafts, so run the full checks locally (`task ci`), push once
  they pass, and mark the PR ready when the work is finished; see CLAUDE.md "CI and Actions
  minutes".
- The `🧪 Build & Test` job builds only the app a change touches (`scripts/changed-apps.mjs`);
  anything shared builds both.
- Docs pages: every page states its status (Works today, In flight, or Roadmap); docs describe
  CryptOS as shipped on `main`; MDX 3, so no explicit `{#id}` heading anchors.
- `golic` does not descend into `vendor/`; its headers are verified by inspection against the
  cryptos-web commit they were copied from, not by CI.
