# Fonts

The two typefaces both CryptOS sites use, self-hosted so the site and the docs
load the same files the same way. Each is the Latin and Latin Extended subset
in WOFF2, taken from the Fontsource builds the sites used before.

| Files                    | Typeface                             | License                                             |
| ------------------------ | ------------------------------------ | --------------------------------------------------- |
| `inter-*.woff2`          | Inter (variable, weights 100 to 900) | SIL Open Font License 1.1, `OFL-inter.txt`          |
| `jetbrains-mono-*.woff2` | JetBrains Mono (400, 500 and 700)    | SIL Open Font License 1.1, `OFL-jetbrains-mono.txt` |

The `@font-face` rules are in `packages/frame/site-frame.css`. Both sites serve
this folder at `/fonts/`: the site through `apps/site/vite.config.ts`, the docs
through `staticDirectories` in `apps/docs/docusaurus.config.ts`.
