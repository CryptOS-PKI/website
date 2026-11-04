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
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { OG_IMAGE, pageMeta, pageTitle, SITE_URL } from "./meta.ts";

type Tag = Record<string, string>;

const tag = (tags: Tag[], key: "name" | "property", value: string) =>
  tags.find((entry) => entry[key] === value)?.content;

test("titles use the site's separators, never a double hyphen", () => {
  assert.equal(pageTitle(), "CryptOS — an immutable, API-driven PKI operating system™");
  assert.equal(pageTitle("Releases"), "Releases · CryptOS");
  assert.doesNotMatch(pageTitle(), /--/);
});

test("every page carries the full Open Graph and Twitter card set, with absolute URLs", () => {
  const tags = pageMeta({
    title: "Releases",
    description: "Downloads.",
    path: "/releases",
  }) as Tag[];
  assert.equal(tags[0].title, "Releases · CryptOS");
  assert.equal(tag(tags, "name", "description"), "Downloads.");
  assert.equal(tag(tags, "property", "og:title"), "Releases · CryptOS");
  assert.equal(tag(tags, "property", "og:description"), "Downloads.");
  assert.equal(tag(tags, "property", "og:type"), "website");
  assert.equal(tag(tags, "property", "og:site_name"), "CryptOS");
  assert.equal(tag(tags, "property", "og:url"), `${SITE_URL}/releases`);
  assert.equal(tag(tags, "property", "og:image"), `${SITE_URL}${OG_IMAGE.path}`);
  assert.equal(tag(tags, "property", "og:image:width"), "1200");
  assert.equal(tag(tags, "property", "og:image:height"), "630");
  assert.equal(tag(tags, "property", "og:image:type"), "image/png");
  assert.ok(tag(tags, "property", "og:image:alt"));
  assert.equal(tag(tags, "name", "twitter:card"), "summary_large_image");
  assert.equal(tag(tags, "name", "twitter:image"), `${SITE_URL}${OG_IMAGE.path}`);
  assert.equal(tag(tags, "name", "twitter:image:alt"), tag(tags, "property", "og:image:alt"));
  for (const entry of tags) {
    if (/url|image$/.test(entry.property ?? entry.name ?? "")) {
      assert.match(entry.content ?? "", /^https:\/\/www\.cryptos-pki\.com\//, entry.content);
    }
  }
});

test("the home page's URL is the site root", () => {
  const tags = pageMeta({ description: "Home.", path: "/" }) as Tag[];
  assert.equal(tag(tags, "property", "og:url"), `${SITE_URL}/`);
  assert.equal(tags[0].title, pageTitle());
});

test("the card image is the one packages/brand ships", () => {
  const png = readFileSync(
    new URL(`../../../../packages/brand/public${OG_IMAGE.path}`, import.meta.url),
  );
  assert.equal(png.readUInt32BE(16), OG_IMAGE.width);
  assert.equal(png.readUInt32BE(20), OG_IMAGE.height);
});

test("every site route builds its meta with pageMeta", () => {
  const routes = readFileSync(new URL("../routes.ts", import.meta.url), "utf8");
  const files = [...routes.matchAll(/"(routes\/[^"]+\.tsx)"/g)].map((match) => match[1]);
  assert.ok(files.length >= 2, "no routes found");
  for (const file of files) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(
      source,
      /export const meta: MetaFunction = \(\) =>\s*pageMeta\(/,
      `${file} does not build its meta with pageMeta`,
    );
  }
});
