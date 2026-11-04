/*
Copyright The CryptOS Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { fontFaceCss, fontUrl, PRELOAD_FONTS } from "./fonts.ts";
import {
  HEADER_MENU_BREAKPOINT,
  HEADER_MENU_MAX_WIDTH,
  NAV_LINK_CLASS,
} from "./header-menu-config.ts";
import { release } from "./release.ts";

const frame = readFileSync(new URL("./site-frame.css", import.meta.url), "utf8");
const fontsDir = new URL("./public/fonts/", import.meta.url);
const fonts = readdirSync(fontsDir)
  .filter((name) => name.endsWith(".woff2"))
  .sort();

test("every font the frame declares is a file in public/fonts, and every file is declared", () => {
  const urls = [...fontFaceCss("/").matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map(
    (match) => match[1],
  );
  assert.ok(urls.length > 0);
  assert.deepEqual([...new Set(urls)].sort(), fonts);
  for (const file of PRELOAD_FONTS) assert.ok(fonts.includes(file), `${file} isn't shipped`);
});

test("the font faces load from the site's base path, so a sub-path build finds them", () => {
  const css = fontFaceCss("/cryptos/site-preview/");
  const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  for (const url of urls) assert.match(url, /^\/cryptos\/site-preview\/fonts\/[^/]+\.woff2$/);
  assert.equal(
    fontUrl("/cryptos/docs-preview/", "inter-latin.woff2"),
    "/cryptos/docs-preview/fonts/inter-latin.woff2",
  );
  assert.doesNotMatch(
    frame,
    /@font-face\s*\{|url\("\/fonts\//,
    "site-frame.css must not load fonts from a bare /fonts/ path",
  );
});

test("every font ships with its licence", () => {
  const files = readdirSync(fontsDir);
  for (const family of ["inter", "jetbrains-mono"]) {
    assert.ok(files.includes(`OFL-${family}.txt`), `no licence for ${family}`);
  }
});

test("the font families keep the names the kit's tokens ask for", () => {
  const families = new Set(
    [...fontFaceCss("/").matchAll(/font-family:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
  assert.deepEqual([...families].sort(), ["Inter Variable", "JetBrains Mono"]);
});

test("the release version is a v-prefixed semver tag", () => {
  assert.match(release.version, /^v\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/);
  assert.equal(release.kind === "prerelease", release.version.includes("-"));
  assert.match(release.publishedOn, /^\d{4}-\d{2}-\d{2}$/);
});

// The header switches to the menu button at one breakpoint, set once in
// site-frame.css, so the site and the docs collapse at the same width.
const mediaWidths = (css: string) =>
  [...css.matchAll(/@media[^{]*\((max|min)-width:\s*(\d+)px\)/g)].map((match) => [
    match[1],
    Number(match[2]),
  ]);

test("the header menu breakpoint is one shared rule in site-frame.css", () => {
  assert.equal(HEADER_MENU_MAX_WIDTH, HEADER_MENU_BREAKPOINT - 1);
  const rule = new RegExp(
    `@media \\(max-width: ${HEADER_MENU_MAX_WIDTH}px\\) \\{[^}]*\\.${NAV_LINK_CLASS}\\s*\\{\\s*display: none !important;`,
  );
  assert.match(frame, rule);
  assert.match(frame, /\.frame-menu\s*\{[^}]*display: none;/);
});

test("neither site sets a header breakpoint of its own", () => {
  const site = readFileSync(
    new URL("../../apps/site/app/components/marketing.css", import.meta.url),
    "utf8",
  );
  const docs = readFileSync(new URL("../../apps/docs/src/css/custom.css", import.meta.url), "utf8");
  for (const css of [site, docs]) {
    assert.doesNotMatch(
      css,
      /\.(nav__row|nav__links|navbar__inner|navbar__items--right)\s*\{[^}]*flex-direction: column/,
    );
    for (const [, width] of mediaWidths(css)) {
      assert.ok(
        width !== HEADER_MENU_MAX_WIDTH && width !== HEADER_MENU_BREAKPOINT,
        "the header breakpoint lives in site-frame.css only",
      );
    }
  }
});

// Body-text links (R2): a colour of their own that meets WCAG AA on the page
// and card backgrounds in both themes, and an underline, so they read as
// links next to the muted body text.
const hexToken = (block: string, name: string) => {
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `--${name} is not a hex colour in this block`);
  return match[1];
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("body-text links meet WCAG AA on the page and card in light and dark", () => {
  const light = frame.slice(frame.indexOf(":root {"), frame.indexOf("}", frame.indexOf(":root {")));
  const darkStart = frame.indexOf(':root[data-theme="dark"] {');
  const dark = frame.slice(darkStart, frame.indexOf("}", darkStart));
  for (const block of [light, dark]) {
    const link = hexToken(block, "frame-link");
    for (const background of ["frame-bg", "frame-surface"]) {
      const ratio = contrast(link, hexToken(block, background));
      assert.ok(ratio >= 4.5, `--frame-link on --${background} is ${ratio.toFixed(2)}:1`);
    }
  }
});

// Docusaurus renders a markdown link with an empty class attribute
// (class=""), so "no class" has to mean no class attribute or an empty one.
// Links in callouts need one more class than the docs theme's
// ".theme-admonition.alert a", which loads after this file.
const BODY_LINK = ':is(:not([class]), [class=""])';

test("body-text links are underlined on both sites, callouts included", () => {
  const start = frame.indexOf(`.frame-prose a${BODY_LINK},`);
  assert.ok(start !== -1, "no shared body-text link rule");
  const rule = frame.slice(start, frame.indexOf("}", start));
  for (const selector of [
    `.frame-prose a${BODY_LINK}`,
    `.markdown a${BODY_LINK}`,
    `.markdown .theme-admonition a${BODY_LINK}`,
  ]) {
    assert.ok(rule.includes(selector), `the rule misses ${selector}`);
  }
  assert.match(rule, /color: var\(--frame-link\);/);
  assert.match(rule, /text-decoration-line: underline;/);
  assert.match(frame, /:hover[^{]*\{[^}]*text-decoration-thickness: 2px;/);
});
