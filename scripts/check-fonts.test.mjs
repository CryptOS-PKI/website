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
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { checkFonts } from "./check-fonts.mjs";

const build = (files) => {
  const dir = mkdtempSync(join(tmpdir(), "check-fonts-"));
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), body);
  }
  return dir;
};

test("a font URL under the base path that resolves to a file passes", () => {
  const dir = build({
    "index.html":
      '<link rel="preload" href="/sub/fonts/a.woff2"><style>@font-face{src:url("/sub/fonts/a.woff2")}</style>',
    "assets/app.css": '@font-face{src:url("/sub/fonts/a.woff2") format("woff2")}',
    "fonts/a.woff2": "x",
  });
  const result = checkFonts(dir, "/sub/");
  assert.deepEqual(result.broken, []);
  assert.equal(result.checked, 3);
});

test("a bare /fonts/ URL fails in a sub-path build", () => {
  const dir = build({
    "assets/app.css": '@font-face{src:url("/fonts/a.woff2")}',
    "fonts/a.woff2": "x",
  });
  assert.deepEqual(checkFonts(dir, "/sub/").broken, [
    { file: join("assets", "app.css"), url: "/fonts/a.woff2", why: "not under /sub/" },
  ]);
});

test("a font URL with no file behind it fails", () => {
  const dir = build({ "index.html": '<link rel="preload" href="/sub/fonts/missing.woff2">' });
  assert.equal(checkFonts(dir, "/sub/").broken[0].why, "no such file");
});

test("a build with no font URLs at all fails, so the check can't pass by accident", () => {
  const dir = build({ "index.html": "<p>no fonts</p>" });
  assert.equal(checkFonts(dir, "/sub/").checked, 0);
});
