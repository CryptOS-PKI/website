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

## Where it lives

- **Cloudflare Pages project:** `cryptos-pki-www`.
- **Domains:** `cryptos-pki.com` and `www.cryptos-pki.com`. I attach both to the Pages project by
  hand in the Cloudflare dashboard (Custom domains); because the domains' DNS already runs on
  Cloudflare, attaching a domain creates its DNS record and certificate automatically. This
  workflow never touches DNS or creates the Pages project itself.
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
