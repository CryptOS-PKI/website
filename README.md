# website ⚡

> 🧭 The CryptOS product site (www.cryptos-pki.com) and the CryptOS docs (docs.cryptos-pki.com), in one repo

Two static sites and the pieces they share, as npm workspaces:

- 🏠 **`apps/site`:** the product site: the home page and the Releases page with the current
  release's downloads. React Router v7 in framework mode, prerendered at build time to plain HTML
  (no Node server at request time), styled with Tailwind CSS and the `@cryptos-pki/ui` design
  kit.
- 📚 **`apps/docs`:** the docs. Docusaurus 3, versioned: each product release gets its own docs
  version, and vNext is unreleased `main`.
- 🔤 **`packages/frame`:** the frame both sites share, so they read as one site: the strip,
  header and footer (`site-frame.css`, `strip.ts`, `content.ts`), the hero both homes open with
  (`hero.tsx`, `hero-content.ts`, `hero.css`), the header's menu button (`header-menu.tsx`), the
  light and dark switch, the self-hosted fonts and `release.ts`, the current product release both
  sites show.
- 🎨 **`packages/brand`:** the CryptOS and FleetOS marks, the favicon and the touch icon.
- 🧩 **`vendor/cryptos-ui`:** a vendored, read-only copy of cryptos-web's `packages/ui` kit
  (see `vendor/cryptos-ui/NOTICE`).

## 🛠 Develop

Before you start: Node 20 or newer (CI uses the version in `.nvmrc`).

```bash
npm ci --ignore-scripts
npm run dev:site              # the product site with HMR
npm run dev:docs              # the docs with hot reload, vNext included
npm run lint                  # eslint (and prettier, outside apps/docs)
npm test                      # the shared packages' and the scripts' tests
npm run typecheck             # both apps
npm run build                 # apps/site/build/client and apps/docs/build
npm run check:links           # internal links in the prerendered site
```

[`go-task`](https://taskfile.dev) wraps the same steps: `task ci` runs the local gate, and
`task license` checks the licence headers.

## 📚 Docs versions

The docs site holds two docs, each with its own sidebar, versions and version picker: CryptOS at
`/docs/cryptos` and FleetOS Manager at `/docs/fleet`. Each follows its own product's release in
`packages/frame/release.ts` (`release` and `fleetRelease`). v0.1.0-rc.1 is the first version of
both and the default. vNext (`main`) is served at `/docs/cryptos/vnext/` and `/docs/fleet/vnext/` in
dev and preview builds, under a banner pointing at the current version; the published docs leave
it out. A release bumps `release.ts` and runs `npm run docs:version` in its own PR, which cuts
both, and the deploy refuses to run until both are cut. The old `/docs/<page>` paths redirect to
the new ones. See [`docs/deploy.md`](docs/deploy.md).

## 🚀 Deploy

Both sites go live on Cloudflare Pages the moment a GitHub Release is published here, and nothing
else deploys them: the site to the project `cryptos-pki-www` (`cryptos-pki.com`,
`www.cryptos-pki.com`) and the docs to `cryptos-pki-docs` (`docs.cryptos-pki.com`). A release
marked pre-release deploys to each project's `dev` branch instead. See
[`docs/deploy.md`](docs/deploy.md) for the build, the Cloudflare side and how to roll back.

## 🙏 Acknowledgements

CryptOS was originally written by [@Bugs5382](https://github.com/Bugs5382).

## ⚖️ License

Apache License 2.0 (c) 2026 The CryptOS Authors
