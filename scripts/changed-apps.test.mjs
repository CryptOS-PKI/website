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

import { changedApps } from "./changed-apps.mjs";

test("a docs-only change builds the docs only", () => {
  assert.deepEqual(changedApps(["apps/docs/docs/getting-started.md"]), {
    siteChanged: false,
    docsChanged: true,
  });
});

test("a site-only change builds the site only", () => {
  assert.deepEqual(changedApps(["apps/site/app/content/release.ts"]), {
    siteChanged: true,
    docsChanged: false,
  });
});

test("a shared package, manifest or workflow builds both", () => {
  for (const file of [
    "packages/frame/site-frame.css",
    "package-lock.json",
    ".github/workflows/checks.yml",
    "scripts/docs-version.mjs",
  ]) {
    assert.deepEqual(changedApps([file]), { siteChanged: true, docsChanged: true }, file);
  }
});

test("root docs alone build neither app", () => {
  assert.deepEqual(changedApps(["README.md", "AGENTS.md", "NOTICE", "docs/deploy.md"]), {
    siteChanged: false,
    docsChanged: false,
  });
});
