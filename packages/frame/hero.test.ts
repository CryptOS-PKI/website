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

import { docsHeroNote, hero, heroLedeText } from "./hero-content.ts";

// Emoji drawn as emoji, and the variation selector that turns a symbol into
// one. The ™ and © signs are text, so they pass.
const emoji = /[\p{Emoji_Presentation}\u{FE0F}]/u;

test("both sites' hero carries the one headline, with the accent on its second line", () => {
  assert.equal(hero.headline, "Your own certificate authority, on a PKI OS");
  assert.equal(hero.headlineAccent, "with no shell to break into.");
});

test("both sites' hero carries the one lede", () => {
  assert.equal(
    heroLedeText,
    "CryptOS turns a bare machine into an immutable, API-driven certificate authority: no shell, no login, no door in except the API. Every image is built from tested source and signed only when you boot it, so you hold the keys, not us.",
  );
  assert.ok(
    hero.lede.some((segment) => segment.accent),
    "the lede marks its key terms",
  );
});

test("the docs home adds who the docs are for", () => {
  assert.equal(
    docsHeroNote,
    "This is the documentation for CryptOS users and administrators: building it, running it, and managing a fleet with FleetOS Manager.",
  );
});

test("the hero's terminal runs real cryptosctl commands", () => {
  const commands = hero.terminal.lines.flatMap((line) => (line.prompt ? [line.prompt] : []));
  assert.deepEqual(commands, ["cryptosctl identity show", "cryptosctl identity validate"]);
  assert.ok(hero.terminal.lines.some((line) => line.text === "OK: certificate chain validates"));
});

test("the hero has no emoji", () => {
  const strings = [
    hero.headline,
    hero.headlineAccent,
    heroLedeText,
    docsHeroNote,
    hero.terminal.title,
    ...hero.terminal.lines.map((line) => line.prompt ?? line.text ?? ""),
  ];
  for (const text of strings) assert.doesNotMatch(text, emoji, text);
});
