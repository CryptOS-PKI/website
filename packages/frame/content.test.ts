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

import {
  frameFooter,
  frameNav,
  legalHtml,
  legalLine,
  legalLines,
  TAGLINE,
  taglineHtml,
} from "./content.ts";
import { release } from "./release.ts";
import { frameLinks } from "./strip.ts";

const docsSide = frameLinks({ siteUrl: "https://www.example", docsUrl: "https://docs.example" });
const siteSide = frameLinks({ siteUrl: "/", docsUrl: "https://docs.example" });

test("the header links are the site's, in its order, then Releases, Docs and GitHub", () => {
  assert.deepEqual(
    frameNav(docsSide).map((link) => link.label),
    [
      "What it is",
      "Trust model",
      "FleetOS Manager",
      "Standards",
      "Trust Center",
      "Releases",
      "Docs",
      "GitHub",
    ],
  );
  assert.equal(frameNav(docsSide)[0].href, "https://www.example/#what-it-is");
  assert.equal(frameNav(siteSide)[0].href, "/#what-it-is");
  assert.equal(frameNav(docsSide)[5].href, "https://www.example/releases");
  assert.equal(frameNav(siteSide)[5].href, "/releases");
  assert.equal(frameNav(siteSide)[6].href, "https://docs.example/");
});

test("the header and footer link the FleetOS Manager page and the Trust Center", () => {
  const hrefOf = (items: { label: string; href: string }[], label: string) =>
    items.find((link) => link.label === label)?.href;
  assert.equal(hrefOf(frameNav(siteSide), "FleetOS Manager"), "/fleetos-manager");
  assert.equal(
    hrefOf(frameNav(docsSide), "FleetOS Manager"),
    "https://www.example/fleetos-manager",
  );
  assert.equal(hrefOf(frameNav(siteSide), "Trust Center"), "/trust");
  assert.equal(hrefOf(frameNav(docsSide), "Trust Center"), "https://www.example/trust");
  const footer = frameFooter(docsSide).groups;
  assert.equal(hrefOf(footer[0].links, "FleetOS Manager"), "https://www.example/fleetos-manager");
  assert.equal(footer[2].links[0].label, "Trust Center");
  assert.equal(footer[2].links[0].href, "https://www.example/trust");
});

test("the footer has the brand tagline and the Product, Resources and Trust groups", () => {
  const footer = frameFooter(docsSide);
  assert.equal(footer.tagline, TAGLINE);
  assert.ok(footer.marks.includes(TAGLINE));
  assert.deepEqual(
    footer.groups.map((group) => group.title),
    ["Product", "Resources", "Trust"],
  );
});

test("the footer carries no download or release-candidate links; Releases goes to the site's page", () => {
  const footerLinks = frameFooter(docsSide).groups.flatMap((group) => group.links);
  for (const link of footerLinks) {
    assert.doesNotMatch(link.label, /download/i, `${link.label} is a download link`);
    assert.ok(!link.label.includes(release.version), `${link.label} names the release`);
    assert.ok(!link.href.includes("/releases/tag/"), `${link.label} links a release tag`);
    assert.ok(!link.href.includes("github.com/CryptOS-PKI/cryptos-appliance/releases"));
  }
  assert.deepEqual(
    footerLinks.filter((link) => link.label === "Releases").map((link) => link.href),
    ["https://www.example/releases"],
  );
});

test("the legal line is two short lines: the marks, then the copyright and licence", () => {
  assert.deepEqual(legalLines(frameFooter(docsSide).marks, 2026), [
    "CryptOS-PKI™, FleetOS™, No shell to break into™ and An immutable, API-driven PKI operating system™ are trademarks of the CryptOS-PKI project.",
    "© 2026 The CryptOS Authors. Licensed under Apache-2.0.",
  ]);
  const html = legalHtml(frameFooter(docsSide).marks, 2026);
  assert.equal(html.match(/<span class="footer__legal-line">/g)?.length, 2);
  assert.match(
    html,
    /<span class="footer__legal-line">© 2026 The CryptOS Authors\. Licensed under Apache-2\.0\.<\/span>$/,
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
