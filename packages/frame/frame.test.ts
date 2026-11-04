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
  const urls = [...frame.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  assert.deepEqual([...new Set(urls)].sort(), fonts);
});

test("every font ships with its licence", () => {
  const files = readdirSync(fontsDir);
  for (const family of ["inter", "jetbrains-mono"]) {
    assert.ok(files.includes(`OFL-${family}.txt`), `no licence for ${family}`);
  }
});

test("the font families keep the names the kit's tokens ask for", () => {
  const families = new Set(
    [...frame.matchAll(/font-family:\s*"([^"]+)"/g)].map((match) => match[1]),
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
