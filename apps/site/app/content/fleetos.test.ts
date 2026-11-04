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

import { fleetDocs, fleetos } from "./fleetos.ts";

test("the deployment guide links go to the FleetOS Manager docs on the docs base given", () => {
  const live = fleetDocs("https://docs.example");
  assert.deepEqual(
    live.map((link) => link.href),
    [
      "https://docs.example/docs/fleet/helm",
      "https://docs.example/docs/fleet/first-run",
      "https://docs.example/docs/fleet",
    ],
  );
  const preview = fleetDocs("http://127.0.0.1:5390/cryptos/docs-preview");
  assert.equal(preview[0].href, "http://127.0.0.1:5390/cryptos/docs-preview/docs/fleet/helm");
});

test("the page sends no one to GitHub for the deployment guide", () => {
  assert.doesNotMatch(JSON.stringify(fleetos), /github\.com/);
});
