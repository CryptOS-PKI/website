# @cryptos-pki/frame 🖼️

> 🧩 What the CryptOS product site and the docs share: the frame, the fonts, the current releases, and consent-first preferences

A private workspace package: `apps/site` and `apps/docs` import it, nothing is published. Run its
tests with `npm test`, here or from the repo root.

## 📦 What's in it

- 🎨 **`site-frame.css`:** the font faces, the frame tokens (column, header, strip, footer), the
  frame colours in light and dark, and the classes for the theme switch, the full-width switch
  and the cookie bar.
- 🧭 **`content.ts`, `strip.ts`, `hero.tsx`, `hero-content.ts`:** the header links, footer, legal
  line, release strip and the hero both homes open with.
- 🏷️ **`release.ts`:** the current CryptOS release (`release`) and FleetOS Manager release
  (`fleetRelease`); each docs instance is versioned after its own.
- 🍪 **`consent.ts`:** the cookie choice, framework-free. See below.
- 🌗 **`theme-pref.ts`, `theme-toggle.tsx`:** the light and dark choice, consent first, and its
  button.
- ↔️ **`full-width.ts`, `full-width-toggle.tsx`:** the docs' full-width content choice, consent
  first, and its button.
- ⚛️ **`use-consent.ts`, `consent-banner.tsx`:** the React side: hooks for the store and the cookie
  bar.
- 🔤 **`emoji.ts`:** strips emoji from navigation labels (the docs sidebar and table of contents).
- 📁 **`public/fonts/`:** the self-hosted fonts and their licences.

## 🍪 Consent-first preferences

Nothing a site does is written to browser storage until the visitor accepts the cookie choice.
There's no tracking behind it; it only decides whether a preference (the theme, the content
width) is remembered on that machine.

- 🕓 **Before an answer:** the theme follows the visitor's system setting (`prefers-color-scheme`)
  and nothing is stored. Pressing the theme switch only opens the cookie bar (`ask()`); the page
  doesn't change. The full-width switch works at once, in memory, and opens the bar too. The bar
  shows only to someone who touched one of those switches.
- ✅ **Accept:** the answer and the preferences are stored (`<prefix>:consent`,
  `<prefix>:pref:<name>` in localStorage). From then on the theme switch flips the theme and the
  choice is stored, and a small head script applies it before the next page paints.
- 🚫 **Decline:** nothing is stored, not even the refusal, and anything stored before is cleared.
  The theme keeps following the system setting; the switch then flips it for this visit only, in
  memory. A later visit can ask again.

`consent.ts`, `theme-pref.ts` and `full-width.ts` have no framework in them; each site adds a thin
wrapper:

- **Site (React Router):** `apps/site/app/components/theme-switch.tsx` calls `pressThemeSwitch`
  and applies what it returns to the page's classes, and follows system changes until the
  visitor picks a theme; `consent-bar.tsx` renders `ConsentBanner` when the store is asking;
  `root.tsx` puts `themeBootScript(prefix)` in `<head>`. React Router's `ScrollRestoration` is
  replaced with `scroll-to-top.tsx`, because it writes to sessionStorage.
- **Docs (Docusaurus):** `apps/docs/src/components/theme-toggle-navbar-item.tsx` calls
  `pressThemeSwitch` and applies what it returns with `setColorMode(theme, {persist: false})`
  (with `respectPrefersColorScheme: true`, Docusaurus follows the system until then); `src/theme/Root.tsx` renders the
  cookie bar; `docusaurus.config.ts` turns off Docusaurus's own storage (`disableSwitch`, no
  `announcementBar`, `versionPersistence: 'none'`, and `src/theme/Tabs` keeps tab choices in the
  URL until consent) and runs the boot scripts at the top of `<body>`, after Docusaurus's own
  theme script.

`scripts/check-no-storage.mjs` proves it on the built sites: it loads every page in jsdom with
storage watched, and on the docs it also hydrates a few pages and uses the switches.

## ♻️ Reusing it on another site

The pieces are product-neutral apart from the storage prefix, so another site (VitalsDA's, for
example) can take them as they are:

1. Copy `consent.ts`, `theme-pref.ts`, `full-width.ts` (if it needs the width switch),
   `use-consent.ts`, `consent-banner.tsx`, `theme-toggle.tsx` and the matching rules from
   `site-frame.css` (`.theme-toggle`, `.width-toggle`, `.frame-consent`) into the site, keeping
   their tests.
2. Pick a prefix for the site's keys, such as `vitalsda-site`, and pass it everywhere: to
   `useBrowserConsent(prefix)` and to `themeBootScript(prefix)`.
3. Add the head script: `themeBootScript(prefix)` inline in `<head>` (or, on Docusaurus, as a
   `preBodyTags` script from a small plugin, so it runs after Docusaurus's theme script).
4. Wire the switch: on a click, call `pressThemeSwitch(consent, currentTheme)`. It returns null
   before the visitor has answered (it has opened the cookie bar; leave the page alone), or the
   theme to show, which you apply to the page. Until the visitor picks a theme
   (`rememberedTheme(consent)` is null), follow `prefers-color-scheme` changes. On Docusaurus,
   apply with `setColorMode(theme, {persist: false})` and set `disableSwitch: true` and
   `respectPrefersColorScheme: true`.
5. Render `<ConsentBanner onAccept={consent.accept} onDecline={consent.decline} />` when
   `useBrowserConsent(prefix).asking` is true.
6. Remove anything else that writes storage on its own (React Router's `ScrollRestoration`,
   Docusaurus's announcement bar, version persistence and tab groups), then run
   `scripts/check-no-storage.mjs` against the build to confirm nothing is written before consent.

Restyle the bar and buttons through the `--frame-*` colour tokens; the markup stays the same.
