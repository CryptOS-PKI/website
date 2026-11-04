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

import { applyTheme, pageTheme, themeInitScript } from "./theme.ts";

const fakeRoot = () => {
  const classes = new Set<string>();
  const attrs = new Map<string, string>();
  return {
    classList: {
      toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)),
    },
    setAttribute: (name: string, value: string) => attrs.set(name, value),
    style: { colorScheme: "" },
    classes,
    attrs,
  };
};

test("only light or dark on the page counts, dark otherwise", () => {
  assert.equal(pageTheme(null), "dark");
  assert.equal(pageTheme("light"), "light");
  assert.equal(pageTheme("dark"), "dark");
  assert.equal(pageTheme("system"), "dark");
});

test("a theme lands on <html> as the kit's class and the frame's data-theme", () => {
  const root = fakeRoot();
  applyTheme(root, "light");
  assert.equal(root.attrs.get("data-theme"), "light");
  assert.equal(root.classes.has("dark"), false);
  assert.equal(root.style.colorScheme, "light");
  applyTheme(root, "dark");
  assert.equal(root.attrs.get("data-theme"), "dark");
  assert.equal(root.classes.has("dark"), true);
});

test("the head script reads the site's consent and theme keys, and never writes", () => {
  assert.match(themeInitScript, /localStorage\.getItem\("cryptos-site:consent"\)/);
  assert.match(themeInitScript, /localStorage\.getItem\("cryptos-site:pref:theme"\)/);
  assert.doesNotMatch(themeInitScript, /setItem|removeItem|cookie/);
});

test("the head script follows the system setting when there's no stored choice", () => {
  assert.match(themeInitScript, /prefers-color-scheme: light/);
});
