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

const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  const storage: StorageLike & { data: Map<string, string> } = {
    data,
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return storage;
};

test("nothing is stored before the visitor answers", () => {
  const storage = memoryStorage();
  const consent = createConsent({ storage });
  assert.equal(consent.state(), "unset");
  consent.set("content-width", "full");
  assert.equal(consent.get("content-width"), "full");
  assert.equal(storage.data.size, 0);
});

test("a preference set before an answer asks for one; nothing asks otherwise", () => {
  const consent = createConsent({ storage: memoryStorage() });
  assert.equal(consent.asking(), false);
  consent.set("content-width", "full");
  assert.equal(consent.asking(), true);
});

test("accepting stores the answer and the preferences already set, and later ones", () => {
  const storage = memoryStorage();
  const consent = createConsent({ storage });
  consent.set("content-width", "full");
  consent.accept();
  assert.equal(consent.state(), "accepted");
  assert.equal(consent.asking(), false);
  assert.equal(storage.data.get("frame:consent"), "accepted");
  assert.equal(storage.data.get("frame:pref:content-width"), "full");
  consent.set("content-width", "normal");
  assert.equal(storage.data.get("frame:pref:content-width"), "normal");
});

test("an accepted visitor's preferences come back on the next visit", () => {
  const storage = memoryStorage({
    "frame:consent": "accepted",
    "frame:pref:content-width": "full",
  });
  const consent = createConsent({ storage });
  assert.equal(consent.state(), "accepted");
  assert.equal(consent.get("content-width"), "full");
});

test("declining stores nothing, keeps the choice for this page view, and stops asking", () => {
  const storage = memoryStorage();
  const consent = createConsent({ storage });
  consent.set("content-width", "full");
  consent.decline();
  assert.equal(consent.state(), "declined");
  assert.equal(consent.asking(), false);
  assert.equal(consent.get("content-width"), "full");
  consent.set("content-width", "normal");
  assert.equal(storage.data.size, 0);
});

test("declining after accepting removes what was stored", () => {
  const storage = memoryStorage({
    "frame:consent": "accepted",
    "frame:pref:content-width": "full",
  });
  const consent = createConsent({ storage });
  consent.decline();
  assert.equal(storage.data.size, 0);
  assert.equal(consent.get("content-width"), "full");
});

test("the keys can be named per site", () => {
  const storage = memoryStorage();
  const consent = createConsent({ storage, prefix: "sneakers-docs" });
  consent.set("content-width", "full");
  consent.accept();
  assert.deepEqual([...storage.data.keys()].sort(), [
    "sneakers-docs:consent",
    "sneakers-docs:pref:content-width",
  ]);
});

test("a blocked or missing storage leaves everything in memory and never throws", () => {
  const throwing: StorageLike = {
    get length(): number {
      throw new Error("blocked");
    },
    key: () => {
      throw new Error("blocked");
    },
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  for (const storage of [throwing, null]) {
    const consent = createConsent({ storage });
    consent.set("content-width", "full");
    consent.accept();
    assert.equal(consent.get("content-width"), "full");
    consent.decline();
    assert.equal(consent.state(), "declined");
  }
});

test("subscribers hear every change, and can stop listening", () => {
  const consent = createConsent({ storage: memoryStorage() });
  let calls = 0;
  const stop = consent.subscribe(() => calls++);
  consent.set("content-width", "full");
  consent.accept();
  stop();
  consent.decline();
  assert.equal(calls, 2);
  assert.equal(consent.revision(), 3);
});
