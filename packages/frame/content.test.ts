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

import { frameFooter, frameNav, legalHtml, legalLine, TAGLINE, taglineHtml } from "./content.ts";
import { release } from "./release.ts";
import { frameLinks } from "./strip.ts";

const docsSide = frameLinks({ siteUrl: "https://www.example", docsUrl: "https://docs.example" });
const siteSide = frameLinks({ siteUrl: "/", docsUrl: "https://docs.example" });

test("the header links are the site's, in its order, then Docs and GitHub", () => {
  assert.deepEqual(
    frameNav(docsSide).map((link) => link.label),
    ["What it is", "Trust model", "FleetOS Manager", "Standards", "Docs", "GitHub"],
  );
  assert.equal(frameNav(docsSide)[0].href, "https://www.example/#what-it-is");
  assert.equal(frameNav(siteSide)[0].href, "/#what-it-is");
  assert.equal(frameNav(siteSide)[4].href, "https://docs.example/");
});

test("the footer has the brand tagline and the Product, Resources and Trust groups", () => {
  const footer = frameFooter(docsSide);
  assert.equal(footer.tagline, TAGLINE);
  assert.ok(footer.marks.includes(TAGLINE));
  assert.deepEqual(
    footer.groups.map((group) => group.title),
    ["Product", "Resources", "Trust"],
  );
  assert.ok(
    footer.groups[0].links.some(
      (link) => link.label === `Download ${release.version}` && link.href === docsSide.download,
    ),
  );
});

test("the legal line names every mark, the tagline last, the holder and the licence", () => {
  assert.equal(
    legalLine(frameFooter(docsSide).marks, 2026),
    "CryptOS-PKI™, FleetOS™, No shell to break into™ and An immutable, API-driven PKI operating system™ are trademarks of the CryptOS-PKI project. © 2026 The CryptOS Authors. Licensed under Apache-2.0.",
  );
});

test("the tagline is a trademark: its last word and ™ never break apart", () => {
  assert.equal(TAGLINE, "An immutable, API-driven PKI operating system");
  assert.equal(
    taglineHtml,
    'An immutable, API-driven PKI operating <span class="nowrap">system<sup class="tm">™</sup></span>.',
  );
  assert.ok(
    legalHtml([TAGLINE], 2026).includes(
      '<span class="nowrap">system<sup class="tm">™</sup></span>',
    ),
  );
});
