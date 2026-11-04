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

import {
  docsInstances,
  docsVersionProblem,
  docsVersions,
  readState,
  releaseVersion,
} from "./docs-version.mjs";

const releaseSource = [
  "export const release = {",
  '  version: "v1.2.3-rc.4",',
  '  kind: "prerelease" as const,',
  "};",
  "export const fleetRelease = {",
  '  version: "v2.0.0",',
  "};",
].join("\n");

test("each product's release version is read from packages/frame/release.ts", () => {
  assert.equal(releaseVersion(releaseSource, "release"), "v1.2.3-rc.4");
  assert.equal(releaseVersion(releaseSource, "fleetRelease"), "v2.0.0");
  assert.throws(() => releaseVersion("export const release = {};", "release"), /release/);
  assert.throws(() => releaseVersion(releaseSource, "otherRelease"), /otherRelease/);
});

test("there are two docs instances, CryptOS and FleetOS Manager, each with its own versions", () => {
  assert.deepEqual(
    docsInstances.map((instance) => [instance.id, instance.releaseExport, instance.versionsFile]),
    [
      ["default", "release", "versions.json"],
      ["fleet", "fleetRelease", "fleet_versions.json"],
    ],
  );
  assert.deepEqual(
    docsInstances.map((instance) => instance.cutCommand),
    ["docs:version", "docs:version:fleet"],
  );
});

test("no versions file means no docs versions", () => {
  assert.deepEqual(docsVersions(undefined), []);
  assert.throws(() => docsVersions('{"v1": true}'));
});

test("a release with no docs version can't deploy, and the message names the docs", () => {
  assert.match(docsVersionProblem("v0.1.0", ["v0.1.0-rc.1"], "FleetOS Manager"), /FleetOS Manager docs have no v0\.1\.0 version/);
  assert.match(docsVersionProblem("v0.1.0", [], "CryptOS"), /CryptOS docs have no v0\.1\.0 version/);
});

test("the release's docs version must be the newest, so it's the default", () => {
  assert.match(
    docsVersionProblem("v0.1.0-rc.1", ["v0.1.0", "v0.1.0-rc.1"], "CryptOS"),
    /isn't the newest/,
  );
  assert.equal(docsVersionProblem("v0.1.0", ["v0.1.0", "v0.1.0-rc.1"], "CryptOS"), null);
});

test("the repo's own release has its version cut in both docs", () => {
  const state = readState();
  assert.equal(state.length, 2);
  for (const { name, version, versions } of state) {
    assert.equal(docsVersionProblem(version, versions, name), null);
  }
});
