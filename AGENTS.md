# AGENTS.md - website

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

Two static sites in one repo, as npm workspaces:

- `apps/site` (`@cryptos-pki/site`): the CryptOS product site (www.cryptos-pki.com), a one-route
  marketing page, not an app. React Router v7 in framework mode prerenders it to static HTML at
  build time (`ssr: false` plus a `prerender()` list in `react-router.config.ts`); there is no
  Node server at request time, and nothing talks to a backend. The page content lives in one
  place, `app/content/cryptos.ts`; the components it feeds (`app/components/`) take their content
  as props.
- `apps/docs` (`@cryptos-pki/docs`): the CryptOS docs (docs.cryptos-pki.com), Docusaurus 3,
  versioned. `docs/` is Next (unreleased `main`); `versioned_docs/` holds one snapshot per
  release.
- `packages/frame` (`@cryptos-pki/frame`): `site-frame.css` (the font faces), the self-hosted
  fonts in `public/fonts/`, and `release.ts`, the current product release both sites show.
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
- Test: `npm test` (`packages/frame`, `packages/brand` and `scripts/` tests)
- Typecheck: `npm run typecheck`
- Build: `npm run build` (or `build:site`, `build:docs`)
- Site link check (after a build): `npm run check:links`
- Docs version check: `npm run check:docs-version`; cut one: `npm run docs:version`
- License headers: `task license` (verify) / `task license:fix` (inject)

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
