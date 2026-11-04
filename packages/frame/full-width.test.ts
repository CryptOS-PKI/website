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
import {
  applyContentWidth,
  CONTENT_WIDTH_ATTRIBUTE,
  contentWidthBootScript,
  isFullWidth,
  setFullWidth,
  widthToggleText,
} from "./full-width.ts";

const memoryStorage = (
  initial: Record<string, string> = {},
): StorageLike & { data: Map<string, string> } => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
};

const fakeRoot = () => {
  const attributes = new Map<string, string>();
  return {
    attributes,
    setAttribute: (name: string, value: string) => void attributes.set(name, value),
    removeAttribute: (name: string) => void attributes.delete(name),
  };
};

test("content is the normal width until the visitor asks for full width", () => {
  const consent = createConsent({ storage: memoryStorage() });
  assert.equal(isFullWidth(consent), false);
});

test("turning full width on and off marks the page root and keeps the choice", () => {
  const consent = createConsent({ storage: memoryStorage() });
  const root = fakeRoot();
  setFullWidth(consent, true, root);
  assert.equal(isFullWidth(consent), true);
  assert.equal(root.attributes.get(CONTENT_WIDTH_ATTRIBUTE), "full");
  setFullWidth(consent, false, root);
  assert.equal(isFullWidth(consent), false);
  assert.equal(root.attributes.has(CONTENT_WIDTH_ATTRIBUTE), false);
});

test("the choice is remembered on the machine only after the visitor accepts", () => {
  const storage = memoryStorage();
  const consent = createConsent({ storage });
  setFullWidth(consent, true, fakeRoot());
  assert.equal(storage.data.size, 0);
  assert.equal(consent.asking(), true);
  consent.accept();
  assert.equal(createConsent({ storage }).get("content-width"), "full");
  assert.equal(isFullWidth(createConsent({ storage })), true);
});

test("applyContentWidth follows the stored choice", () => {
  const root = fakeRoot();
  applyContentWidth(
    createConsent({
      storage: memoryStorage({ "frame:consent": "accepted", "frame:pref:content-width": "full" }),
    }),
    root,
  );
  assert.equal(root.attributes.get(CONTENT_WIDTH_ATTRIBUTE), "full");
});

const runBootScript = (storage: StorageLike | "throws", prefix?: string) => {
  const root = fakeRoot();
  const localStorage =
    storage === "throws"
      ? {
          getItem: () => {
            throw new Error("blocked");
          },
        }
      : storage;
  new Function("document", "localStorage", contentWidthBootScript(prefix))(
    { documentElement: root },
    localStorage,
  );
  return root;
};

test("the boot script widens the page before it paints, only for an accepted full-width choice", () => {
  assert.equal(
    runBootScript(
      memoryStorage({ "frame:consent": "accepted", "frame:pref:content-width": "full" }),
    ).attributes.get(CONTENT_WIDTH_ATTRIBUTE),
    "full",
  );
  assert.equal(
    runBootScript(memoryStorage({ "frame:pref:content-width": "full" })).attributes.size,
    0,
  );
  assert.equal(runBootScript(memoryStorage({ "frame:consent": "accepted" })).attributes.size, 0);
  assert.equal(runBootScript(memoryStorage()).attributes.size, 0);
  assert.equal(runBootScript("throws").attributes.size, 0);
});

test("the boot script reads the same keys as the store", () => {
  const storage = memoryStorage();
  const consent = createConsent({ storage, prefix: "other" });
  setFullWidth(consent, true, fakeRoot());
  consent.accept();
  assert.equal(runBootScript(storage, "other").attributes.get(CONTENT_WIDTH_ATTRIBUTE), "full");
});

test("the switch says what pressing it does: Full width while off, Standard width while on", () => {
  assert.deepEqual(widthToggleText(false), {
    label: "Full width",
    other: "Standard width",
    title: "Widen the content to the window",
  });
  assert.deepEqual(widthToggleText(true), {
    label: "Standard width",
    other: "Full width",
    title: "Narrow the content back to the page column",
  });
});
