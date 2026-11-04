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

import { stripEmoji } from "./emoji.ts";

test("a leading emoji and its space come off a label", () => {
  assert.equal(stripEmoji("\u{1F510} What is CryptOS?"), "What is CryptOS?");
  assert.equal(stripEmoji("\u{270B} Approving agent requests"), "Approving agent requests");
});

test("emoji with a variation selector, a modifier or a joiner come off whole", () => {
  assert.equal(stripEmoji("\u{2638}\u{FE0F} Deploy with Helm"), "Deploy with Helm");
  assert.equal(stripEmoji("\u{1F5A5}\u{FE0F} The web UI"), "The web UI");
  assert.equal(stripEmoji("\u{1F44B}\u{1F3FD} Hello"), "Hello");
  assert.equal(stripEmoji("\u{1F9D1}\u{200D}\u{1F4BB} Contributing"), "Contributing");
  assert.equal(stripEmoji("Keys \u{1F511} stay in the TPM"), "Keys stay in the TPM");
});

test("text symbols that only look like emoji stay", () => {
  assert.equal(
    stripEmoji("CryptOS\u{2122} and \u{A9}, \u{AE}"),
    "CryptOS\u{2122} and \u{A9}, \u{AE}",
  );
  assert.equal(stripEmoji("A \u{2194} B, step 1 \u{2192} 2"), "A \u{2194} B, step 1 \u{2192} 2");
  assert.equal(stripEmoji("RFC 5280 #1"), "RFC 5280 #1");
});

test("markup in a heading survives", () => {
  assert.equal(
    stripEmoji("\u{1F4C4} Machine config: <code>pki</code>"),
    "Machine config: <code>pki</code>",
  );
});
