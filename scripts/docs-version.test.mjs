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

import { docsVersionProblem, docsVersions, readState, releaseVersion } from "./docs-version.mjs";

test("the release version is read from packages/frame/release.ts", () => {
  assert.equal(
    releaseVersion('export const release = {\n  version: "v1.2.3-rc.4",\n};'),
    "v1.2.3-rc.4",
  );
  assert.throws(() => releaseVersion("export const release = {};"));
});

test("no versions.json means no docs versions", () => {
  assert.deepEqual(docsVersions(undefined), []);
  assert.throws(() => docsVersions('{"v1": true}'));
});

test("a release with no docs version can't deploy", () => {
  assert.match(docsVersionProblem("v0.1.0", ["v0.1.0-rc.1"]), /no v0\.1\.0 version/);
  assert.match(docsVersionProblem("v0.1.0", []), /no v0\.1\.0 version/);
});

test("the release's docs version must be the newest, so it's the default", () => {
  assert.match(docsVersionProblem("v0.1.0-rc.1", ["v0.1.0", "v0.1.0-rc.1"]), /isn't the newest/);
  assert.equal(docsVersionProblem("v0.1.0", ["v0.1.0", "v0.1.0-rc.1"]), null);
});

test("the repo's own release has its docs version cut", () => {
  const { version, versions } = readState();
  assert.equal(docsVersionProblem(version, versions), null);
});
