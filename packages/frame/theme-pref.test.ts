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
import { chooseTheme, rememberedTheme, themeBootScript } from "./theme-pref.ts";

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

test("the theme is dark until the visitor picks one", () => {
  assert.equal(rememberedTheme(createConsent({ storage: spyStorage() })), "dark");
});

test("picking a theme before consent writes nothing and asks for an answer", () => {
  const storage = spyStorage();
  const consent = createConsent({ storage });
  chooseTheme(consent, "light");
  assert.equal(rememberedTheme(consent), "light");
  assert.deepEqual(storage.writes, []);
  assert.equal(consent.asking(), true);
});

test("after accepting, the theme is remembered for the next visit", () => {
  const storage = spyStorage();
  const consent = createConsent({ storage, prefix: "site" });
  chooseTheme(consent, "light");
  consent.accept();
  assert.equal(storage.data.get("site:pref:theme"), "light");
  assert.equal(rememberedTheme(createConsent({ storage, prefix: "site" })), "light");
});

test("after declining, the theme lasts for this page view only", () => {
  const storage = spyStorage();
  const consent = createConsent({ storage });
  chooseTheme(consent, "light");
  consent.decline();
  assert.equal(rememberedTheme(consent), "light");
  assert.deepEqual(storage.writes, []);
  assert.equal(rememberedTheme(createConsent({ storage })), "dark");
});

const fakeRoot = () => {
  const classes = new Set(["dark"]);
  const attributes = new Map([["data-theme", "dark"]]);
  return {
    classes,
    attributes,
    style: { colorScheme: "dark" },
    classList: { remove: (name: string) => void classes.delete(name) },
    setAttribute: (name: string, value: string) => void attributes.set(name, value),
  };
};

const runBoot = (storage: StorageLike, prefix?: string) => {
  const root = fakeRoot();
  new Function("document", "localStorage", themeBootScript(prefix))(
    { documentElement: root },
    storage,
  );
  return root;
};

test("the head script puts a remembered light theme on <html> before the page paints", () => {
  const root = runBoot(spyStorage({ "frame:consent": "accepted", "frame:pref:theme": "light" }));
  assert.equal(root.attributes.get("data-theme"), "light");
  assert.equal(root.attributes.get("data-theme-choice"), "light");
  assert.equal(root.classes.has("dark"), false);
  assert.equal(root.style.colorScheme, "light");
});

test("the head script leaves dark alone without consent, and never writes", () => {
  for (const initial of [{}, { "frame:pref:theme": "light" }, { "frame:consent": "accepted" }]) {
    const storage = spyStorage(initial);
    const root = runBoot(storage);
    assert.equal(root.attributes.get("data-theme"), "dark");
    assert.deepEqual(storage.writes, []);
  }
});

test("the head script survives blocked storage", () => {
  const blocked = {
    getItem: () => {
      throw new Error("blocked");
    },
  } as unknown as StorageLike;
  assert.equal(runBoot(blocked).attributes.get("data-theme"), "dark");
});
