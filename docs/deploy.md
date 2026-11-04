# Deploying the sites

## What goes live, and when

Both sites deploy only when I publish a GitHub Release in this repo: the product site
(`apps/site`) and the docs (`apps/docs`), together. The `Deploy` workflow
(`.github/workflows/deploy.yml`) listens for the `release: published` event and nothing else --
not a push to `main`, not a pull request, not a manual dispatch. Merging a PR never puts anything
on the internet by itself: content and code land on `main` first, and I choose when to publish the
release that ships them.

When a release is published, the workflow checks out that release's tag and then:

1. Checks the docs versions (`npm run check:docs-version`). Each docs instance follows its own
   product's release in `packages/frame/release.ts`: `release` (CryptOS) must be cut in
   `apps/docs/versions.json` and `fleetRelease` (FleetOS Manager) in
   `apps/docs/fleet_versions.json`, each as the newest version there. If either isn't, the run
   stops before anything builds or deploys.
2. Runs `npm ci --ignore-scripts`, then builds the site and the docs. The docs build sets
   `DOCS_INCLUDE_NEXT=false`, so the published docs carry the released versions only, not Next
   (unreleased `main`). Both builds finish before either deploy starts, so a failed build never
   leaves one site on the new release and the other on the old one.
3. Uploads `apps/site/build/client/` to the Pages project `cryptos-pki-www` and `apps/docs/build/`
   to `cryptos-pki-docs`, with `cloudflare/wrangler-action` pinned to a commit so a moved tag
   can't change the code trusted with deploy credentials.

## Cutting the docs version for a release

The docs site has two docs, each versioned on its own: CryptOS at `/docs/cryptos` and FleetOS
Manager at `/docs/fleet`. In each, the newest cut version is the default; Next (`main`) is served
at `/docs/cryptos/next/` and `/docs/fleet/next/` in dev and preview builds, under a banner that
points at the current version.

A release that changes a product version gets its own PR first:

1. Bump `version` (and `publishedOn`) in `release` for CryptOS, and `version` in `fleetRelease`
   for FleetOS Manager, in `packages/frame/release.ts`.
2. Run `npm run docs:version`. It snapshots each instance whose version isn't cut yet:
   `apps/docs/docs` with `sidebars.ts` for CryptOS, `apps/docs/fleet` with `sidebars-fleet.ts`
   for FleetOS Manager.
3. Commit what it wrote (`versions.json`, `versioned_docs/` and `versioned_sidebars/` for
   CryptOS; `fleet_versions.json`, `fleet_versioned_docs/` and `fleet_versioned_sidebars/` for
   FleetOS Manager, all under `apps/docs/`) with the bump, and merge the PR.

Then publish the release. If the PR was missed, the deploy fails at the docs version check; merge
the PR and publish the release again. The workflow never commits anything itself: `main` takes
changes only through a PR, and a commit made after the tag wouldn't be in the tagged source.

The docs versions follow the product releases in `release.ts`, not this repo's own tags. This
repo's releases are plain SemVer (`v0.2.0`), with no rc.

## Pre-release builds go to dev, not production

I tick "Set as a pre-release" on a GitHub Release when I want to look at a build before it goes
live. The workflow reads `github.event.release.prerelease` and picks the Pages branch from it:

- **Pre-release:** deploys to each project's `dev` branch, served at
  `dev.cryptos-pki-www.pages.dev` and `dev.cryptos-pki-docs.pages.dev`.
- **Normal release:** deploys to `main`, each project's production branch: `cryptos-pki.com`,
  `www.cryptos-pki.com` and `docs.cryptos-pki.com`.

## Where it lives

- **Cloudflare Pages projects:** `cryptos-pki-www` (the site) and `cryptos-pki-docs` (the docs).
  Before each deploy, the workflow lists the account's Pages projects and creates the project
  (production branch `main`) only when it isn't there yet, so the first published release sets it
  up and every later release skips that step.
- **Domains:** `cryptos-pki.com` and `www.cryptos-pki.com` on `cryptos-pki-www`, and
  `docs.cryptos-pki.com` on `cryptos-pki-docs`. I attach each one to its Pages project once, by
  hand, in the Cloudflare dashboard (Custom domains), after the first deploy has created the
  project. The zone's DNS runs on Cloudflare, so attaching a domain creates its DNS record and
  certificate. The workflow never touches DNS or custom domains.
- **Credentials:** the org secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, scoped to
  Cloudflare Pages Edit on my account only. They live in GitHub org secrets, never in this repo or
  its workflow logs.

## Rolling back

Two ways, depending on how fast I need it:

1. **Publish an older release.** Re-publishing a previous GitHub Release re-runs the `Deploy`
   workflow against that release's tag, which rebuilds and re-uploads both sites. This is the
   normal rollback path, because it goes through the same build the original release did.
2. **Redeploy from the Cloudflare dashboard.** Every deployment stays listed under its Pages
   project's Deployments tab. Picking an older one and choosing "Rollback to this deployment"
   switches that site's traffic to it immediately, without rebuilding. This is the faster path
   when I need the old content back right away and can fix the release properly afterward.
