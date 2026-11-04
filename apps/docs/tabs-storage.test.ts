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

import { tabsWithoutStorage } from "./src/lib/tabs-storage.ts";

test("before consent a tab group keeps its choice in the URL, not in storage", () => {
  assert.deepEqual(tabsWithoutStorage({ groupId: "os", queryString: true }, false), {
    groupId: undefined,
    queryString: "os",
  });
  assert.deepEqual(tabsWithoutStorage({ groupId: "os" }, false), {
    groupId: undefined,
    queryString: "os",
  });
  assert.deepEqual(tabsWithoutStorage({ groupId: "os", queryString: "platform" }, false), {
    groupId: undefined,
    queryString: "platform",
  });
});

test("after consent a tab group remembers its choice as Docusaurus does", () => {
  const props = { groupId: "os", queryString: true };
  assert.equal(tabsWithoutStorage(props, true), props);
});

test("a tab group with no groupId is left alone", () => {
  const props = { queryString: false };
  assert.equal(tabsWithoutStorage(props, false), props);
});
