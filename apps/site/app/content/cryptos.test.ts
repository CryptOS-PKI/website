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

import { heroLedeText } from "@cryptos-pki/frame/hero-content";

import * as content from "./cryptos.ts";

// Emoji drawn as emoji, and the variation selector that turns a symbol into
// one. The ™ and © signs are text, so they pass.
const emoji = /[\p{Emoji_Presentation}\u{FE0F}]/u;

const strings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
};

test("the product site carries no emoji", () => {
  for (const text of strings(content)) assert.doesNotMatch(text, emoji, text);
});

test("the page description and link preview are the hero's lede", () => {
  assert.equal(content.meta.description, heroLedeText);
});

test("the header links the Releases page, after Standards and before Docs", () => {
  const labels = content.nav.links.map((link) => link.label);
  assert.equal(labels.indexOf("Releases"), labels.indexOf("Standards") + 1);
  assert.equal(labels.indexOf("Docs"), labels.indexOf("Releases") + 1);
  assert.equal(content.nav.links.find((link) => link.label === "Releases")?.href, "/releases");
});

test("the footer has no download or release-candidate links", () => {
  for (const link of content.footer.groups.flatMap((group) => group.links)) {
    assert.doesNotMatch(link.label, /download|rc\.\d/i, link.label);
  }
});
