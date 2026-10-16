# Deploying the site

## What goes live, and when

This site deploys only when I publish a GitHub Release in this repo. The `Deploy`
workflow (`.github/workflows/job-deploy-release.yaml`) listens for the `release: published`
event and nothing else -- not a push to `main`, not a pull request, not a manual dispatch. That
means merging a PR never puts anything on the internet by itself: content and code land on `main`
first, and I choose when to cut and publish the release that actually ships it.

When a release is published, the workflow checks out that release's tag, runs `npm ci` and
`npm run build` the same way CI does on every PR, and uploads the prerendered `build/client/`
folder to Cloudflare Pages with `cloudflare/wrangler-action`, pinned to a specific commit so a
tag can't silently move the code I'm trusting with deploy credentials.

## Pre-release (rc) builds go to dev, not production

I tick "Set as a pre-release" on a GitHub Release when I'm publishing an rc. The workflow reads
`github.event.release.prerelease` and picks the Pages branch to deploy to from it:

- **Pre-release (`prerelease: true`):** deploys to the `dev` branch, which Cloudflare Pages serves
  at `dev.cryptos-pki-www.pages.dev`. I can look at the rc there before it goes anywhere near
  `cryptos-pki.com`.
- **Normal release (`prerelease: false`):** deploys to `main`, the project's production branch,
  exactly as before -- that's what goes live at `cryptos-pki.com`.

Everything else about the run is identical: same checkout, same build, same Cloudflare Pages
project, same secrets. Only the `--branch` the final `wrangler pages deploy` uses changes.

## Where it lives

- **Cloudflare Pages project:** `cryptos-pki-www`. Before it deploys, the workflow lists the
  account's Pages projects and creates `cryptos-pki-www` (production branch `main`) only when it
  isn't there yet, so the first published release sets the project up and every later release
  skips that step.
- **Domains:** `cryptos-pki.com` and `www.cryptos-pki.com`. I attach both to the Pages project
  once, by hand, in the Cloudflare dashboard (Custom domains), after the first deploy has created
  the project. Because the domains' DNS already runs on Cloudflare, attaching a domain creates its
  DNS record and certificate automatically. The workflow never touches DNS or custom domains.
- **Credentials:** the org secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, scoped to
  Cloudflare Pages Edit on my account only. They live in GitHub org secrets, never in this repo or
  its workflow logs.

## Rolling back

Two ways, depending on how fast I need it:

1. **Publish an older release.** Re-publishing a previous GitHub Release re-runs the `Deploy`
   workflow against that release's tag, which rebuilds and re-uploads that version's
   `build/client/` to the same Cloudflare Pages project. This is the normal rollback path, because
   it goes through the same build the original release did.
2. **Redeploy from the Cloudflare dashboard.** Every Pages deployment Wrangler uploads stays
   listed under the `cryptos-pki-www` project's Deployments tab. Picking an older one and choosing
   "Rollback to this deployment" switches production traffic to it immediately, without rebuilding
   anything. This is the faster path when I need the old content back right away and can fix the
   release properly afterward.
