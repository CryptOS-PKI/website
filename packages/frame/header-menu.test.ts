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

import { HEADER_MENU_BREAKPOINT, nextMenuState } from "./header-menu-config.ts";

test("the header switches to the menu under 1050px, where all the links still fit a nav gap clear of the wordmark", () => {
  assert.equal(HEADER_MENU_BREAKPOINT, 1050);
});

test("the menu opens on the button and closes on the button, Escape, a link or a click outside", () => {
  assert.equal(nextMenuState(false, "toggle"), true);
  assert.equal(nextMenuState(true, "toggle"), false);
  for (const event of ["escape", "link", "outside"] as const) {
    assert.equal(nextMenuState(true, event), false, event);
    assert.equal(nextMenuState(false, event), false, event);
  }
});
