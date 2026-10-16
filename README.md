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

## 🙏 Acknowledgements

CryptOS was originally written by [@Bugs5382](https://github.com/Bugs5382).

## ⚖️ License

Apache License 2.0 (c) 2026 The CryptOS Authors
