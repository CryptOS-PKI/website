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
