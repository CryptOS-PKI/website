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
import { test } from "node:test";

import { release } from "./release.ts";
import { frameLinks, releaseStrip, stripHtml } from "./strip.ts";

const links = frameLinks({ siteUrl: "https://site.example/", docsUrl: "https://docs.example" });

test("the frame links drop a trailing slash and keep the two sites apart", () => {
  assert.equal(links.site, "https://site.example");
  assert.equal(links.docs, "https://docs.example");
  assert.equal(links.status, "https://docs.example/docs/introduction/status-roadmap");
});

test("the strip names the current release and links the site's Releases page and the project status", () => {
  const strip = releaseStrip(links);
  assert.equal(strip.heading, `${release.version} is out.`);
  assert.deepEqual(
    strip.links.map((link) => link.href),
    ["https://site.example/releases", "https://docs.example/docs/introduction/status-roadmap"],
  );
});

test("the strip markup is the same for both sites and escapes its text", () => {
  const html = stripHtml(links);
  assert.match(html, /^<div class="strip__row">/);
  assert.match(
    html,
    /<span class="strip__badge"><span class="strip__dot" aria-hidden="true"><\/span>Pre-release<\/span>/,
  );
  assert.ok(html.includes(`<strong>${release.version} is out.</strong>`));
  assert.ok(!html.includes("undefined"));
  assert.equal(stripHtml(links), html);
});
