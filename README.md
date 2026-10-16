# website ⚡

> 🧭 The CryptOS product site (www.cryptos-pki.com)

A static marketing site: React Router v7 in framework mode, prerendered at build time to plain
HTML (no Node server at request time), styled with Tailwind CSS and the `@cryptos-pki/ui` design
kit (vendored from cryptos-web; see `vendor/cryptos-ui/NOTICE`).

## 🛠 Develop

Before you start: Node 20+.

```bash
npm install
npm run dev         # react-router dev server with HMR
npm run build       # react-router build -> prerendered static HTML in build/client/
npm run preview     # serve the prerendered build
npm run lint        # eslint + prettier
npm run typecheck   # react-router typegen + tsc --noEmit
```

`build/client/` is the whole deployable site: static files, no server required.

## 🚀 Deploy

The site goes live on Cloudflare Pages (project `cryptos-pki-www`, domains `cryptos-pki.com` and
`www.cryptos-pki.com`) the moment a GitHub Release is published here -- nothing else deploys it.
A release marked pre-release deploys to `dev.cryptos-pki-www.pages.dev` instead, so an rc can be
checked before it goes live; a normal release still deploys to production. The first deploy creates
the Pages project if it doesn't exist yet; the custom domains are attached once by hand in
Cloudflare after that. See [`docs/deploy.md`](docs/deploy.md) for what that build contains, the
Cloudflare side of the setup, and how to roll back.

## 🙏 Acknowledgements

CryptOS was originally written by [@Bugs5382](https://github.com/Bugs5382).

## ⚖️ License

Apache License 2.0 (c) 2026 The CryptOS Authors
