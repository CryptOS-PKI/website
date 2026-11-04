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

import { createConsent, type StorageLike } from "./consent.ts";
import { pressThemeSwitch, rememberedTheme, themeBootScript } from "./theme-pref.ts";

const spyStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  const writes: string[] = [];
  const storage: StorageLike & { data: Map<string, string>; writes: string[] } = {
    data,
    writes,
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      writes.push(`set ${key}`);
      data.set(key, value);
    },
    removeItem: (key) => {
      writes.push(`remove ${key}`);
      data.delete(key);
    },
  };
  return storage;
};

test("with no choice of the visitor's own, the page follows the system setting", () => {
  assert.equal(rememberedTheme(createConsent({ storage: spyStorage() })), null);
});

test("before an answer, the switch only asks: the theme stays and nothing is stored", () => {
  const storage = spyStorage();
  const consent = createConsent({ storage });
  assert.equal(pressThemeSwitch(consent, "light"), null);
  assert.equal(consent.asking(), true);
  assert.equal(rememberedTheme(consent), null);
  assert.deepEqual(storage.writes, []);
});

test("after accepting, the switch flips the theme and remembers it for the next visit", () => {
  const storage = spyStorage();
  const consent = createConsent({ storage, prefix: "site" });
  consent.accept();
  assert.equal(pressThemeSwitch(consent, "light"), "dark");
  assert.equal(storage.data.get("site:pref:theme"), "dark");
  assert.equal(rememberedTheme(createConsent({ storage, prefix: "site" })), "dark");
});

test("after declining, the switch flips the theme for this visit only", () => {
  const storage = spyStorage();
  const consent = createConsent({ storage });
  consent.ask();
  consent.decline();
  assert.equal(pressThemeSwitch(consent, "dark"), "light");
  assert.equal(rememberedTheme(consent), "light");
  assert.equal(consent.asking(), false);
  assert.deepEqual(storage.writes, []);
  assert.equal(rememberedTheme(createConsent({ storage })), null);
});

const fakeRoot = () => {
  const classes = new Set(["dark"]);
  const attributes = new Map([["data-theme", "dark"]]);
  return {
    classes,
    attributes,
    style: { colorScheme: "dark" },
    classList: {
      toggle: (name: string, on: boolean) => void (on ? classes.add(name) : classes.delete(name)),
    },
    setAttribute: (name: string, value: string) => void attributes.set(name, value),
  };
};

const runBoot = (storage: StorageLike, systemDark: boolean, prefix?: string) => {
  const root = fakeRoot();
  const matchMedia = (query: string) => ({
    matches: query.includes("dark") ? systemDark : !systemDark,
  });
  new Function("document", "localStorage", "matchMedia", themeBootScript(prefix))(
    { documentElement: root },
    storage,
    matchMedia,
  );
  return root;
};

test("the head script follows the system setting when there's no stored choice", () => {
  const light = runBoot(spyStorage(), false);
  assert.equal(light.attributes.get("data-theme"), "light");
  assert.equal(light.attributes.get("data-theme-choice"), "system");
  assert.equal(light.classes.has("dark"), false);
  assert.equal(light.style.colorScheme, "light");
  const dark = runBoot(spyStorage(), true);
  assert.equal(dark.attributes.get("data-theme"), "dark");
  assert.equal(dark.classes.has("dark"), true);
});

test("a stored choice only counts once the visitor has accepted", () => {
  assert.equal(
    runBoot(spyStorage({ "frame:pref:theme": "light" }), true).attributes.get("data-theme"),
    "dark",
  );
  const chosen = runBoot(
    spyStorage({ "frame:consent": "accepted", "frame:pref:theme": "dark" }),
    false,
  );
  assert.equal(chosen.attributes.get("data-theme"), "dark");
  assert.equal(chosen.attributes.get("data-theme-choice"), "dark");
  assert.equal(chosen.classes.has("dark"), true);
});

test("the head script never writes", () => {
  for (const initial of [{}, { "frame:consent": "accepted", "frame:pref:theme": "light" }]) {
    const storage = spyStorage(initial);
    runBoot(storage, true);
    assert.deepEqual(storage.writes, []);
  }
});

test("the head script survives blocked storage and a missing matchMedia", () => {
  const blocked = {
    getItem: () => {
      throw new Error("blocked");
    },
  } as unknown as StorageLike;
  const root = fakeRoot();
  new Function("document", "localStorage", "matchMedia", themeBootScript())(
    { documentElement: root },
    blocked,
    undefined,
  );
  assert.equal(root.attributes.get("data-theme"), "dark");
});
