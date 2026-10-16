# AGENTS.md - website

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

The CryptOS product site (www.cryptos-pki.com): a one-route marketing page, not an app. It ships
static HTML, prerendered at build time by React Router v7 in framework mode (`ssr: false` plus a
`prerender()` list in `react-router.config.ts`) -- there is no Node server at request time, and
nothing here talks to a backend. The page content lives in one place, `app/content/cryptos.ts`;
the components it feeds are reusable base-layer pieces (`app/components/`) meant to be shared by a
future product site, not CryptOS-specific themselves.

## Layout

- `app/content/cryptos.ts` - all of the page's copy and structure (nav links, hero, feature list,
  footer). A new product site reuses the components and swaps in its own file in this shape.
- `app/components/` - presentational pieces (hero, nav, section, feature grid, terminal card,
  footer). No data fetching; they take their content as props.
- `app/routes/home.tsx` - the one route, composes the components from the content above.
- `app/root.tsx` / `app/routes.ts` - React Router's document shell and route table.
- `vendor/cryptos-ui/` - a vendored, read-only copy of cryptos-web's `packages/ui` design kit (see
  `vendor/cryptos-ui/NOTICE` for the commit it was copied from). Not linted, typechecked or
  formatted here (see `eslint.config.mjs` and `.prettierignore`); update it by re-copying from
  cryptos-web, not by editing it in place.
- `public/` - files served as-is (favicon).

## Build, test, lint

- Build: `npm run build` (prerenders to `build/client/`)
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Link check (after a build): `node scripts/check-links.mjs build/client`
- License headers: `task license` (verify) / `task license:fix` (inject)

There is no test suite: this is static content with no business logic to unit-test; CI instead
builds, lints, typechecks and checks the prerendered output's internal links.

## Logging

Follow the logging rules in `CLAUDE.md`. In short:

- Log generously: entry and exit of significant operations, decisions and branches, retries, state
  changes, external calls (target, duration, outcome), and every error with its context.
- Levels: `trace` for step-by-step detail, `debug` for flow, `info` for lifecycle, `warn` and
  `error` for problems. The environment filters the volume, so err on the side of too much.
- Environments: local dev `trace` with `LOG_FORMAT=console` (never JSON), dev cluster `debug`,
  qa/staging `info`, production `error`. Every cluster environment logs JSON. Set levels through
  `LOG_LEVEL` and `LOG_FORMAT`, never in code; local settings live in the run target or
  `.env.example`.
- Never log secrets, tokens, or personal data, not even at `trace`. Log an opaque or keyed ID.

## Conventions and gotchas

- See `CLAUDE.md` for the branch/commit/PR rules; they are enforced by the git hooks in
  `.claude/hooks` (run `bash .claude/hooks/install.sh` once per clone).
- Open every PR as a draft. CI skips drafts, so run the full checks locally, push once they pass,
  and mark the PR ready when the work is finished; see CLAUDE.md "CI and Actions minutes".
- A new product site starts from this repo's `app/components/` and `react-router.config.ts`, with
  its own `app/content/<product>.ts` -- the components take all product-specific copy as props, so
  nothing in them should need to change for a second product.
- `golic` does not descend into `vendor/`; its headers are verified by inspection against the
  cryptos-web commit they were copied from, not by CI.
