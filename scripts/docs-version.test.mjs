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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  docsInstances,
  docsVersionProblem,
  docsVersions,
  readState,
  releaseVersion,
  releasedLinks,
  rewriteSnapshotLinks,
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
  assert.match(
    docsVersionProblem("v0.1.0", ["v0.1.0-rc.1"], "FleetOS Manager"),
    /FleetOS Manager docs have no v0\.1\.0 version/,
  );
  assert.match(
    docsVersionProblem("v0.1.0", [], "CryptOS"),
    /CryptOS docs have no v0\.1\.0 version/,
  );
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

test("a snapshot links the other docs' released pages, not their vNext", () => {
  const cases = [
    ["[a](/docs/fleet/vnext)", "[a](/docs/fleet)"],
    ["[a](/docs/fleet/vnext/helm)", "[a](/docs/fleet/helm)"],
    [
      "[a](/docs/cryptos/vnext/using/audit-log#1-list)",
      "[a](/docs/cryptos/using/audit-log#1-list)",
    ],
    ['<a href="/docs/fleet/vnext">x</a>', '<a href="/docs/fleet">x</a>'],
    ["see /docs/cryptos/vnext, then /docs/fleet/vnext.", "see /docs/cryptos, then /docs/fleet."],
    ["[a](/docs/fleet/vnext?x=1)", "[a](/docs/fleet?x=1)"],
  ];
  for (const [before, after] of cases) assert.equal(releasedLinks(before), after, before);
});

test("links that only look like vNext links are left alone", () => {
  for (const text of [
    "[a](/docs/fleet/vnextra)",
    "[a](/docs/fleet/vnext-notes)",
    "[a](/docs/other/vnext/x)",
    "[a](https://example.org/docs/fleet/vnext/x)",
    "the vnext docs",
    "[a](/docs/fleet/helm)",
  ]) {
    assert.equal(releasedLinks(text), text);
  }
});

test("rewriting a snapshot changes only its markdown pages and reports them", () => {
  const dir = mkdtempSync(join(tmpdir(), "snapshot-"));
  try {
    mkdirSync(join(dir, "about"), { recursive: true });
    writeFileSync(join(dir, "about", "cncf.md"), "[x](/docs/fleet/vnext/helm)\n");
    writeFileSync(join(dir, "intro.mdx"), "<a href='/docs/cryptos/vnext'>y</a>\n");
    writeFileSync(join(dir, "clean.md"), "[z](/docs/fleet/helm)\n");
    writeFileSync(join(dir, "data.json"), '{"to": "/docs/fleet/vnext"}\n');

    const changed = rewriteSnapshotLinks(dir);

    assert.deepEqual(changed.sort(), ["about/cncf.md", "intro.mdx"]);
    assert.equal(readFileSync(join(dir, "about", "cncf.md"), "utf8"), "[x](/docs/fleet/helm)\n");
    assert.equal(readFileSync(join(dir, "intro.mdx"), "utf8"), "<a href='/docs/cryptos'>y</a>\n");
    assert.equal(readFileSync(join(dir, "clean.md"), "utf8"), "[z](/docs/fleet/helm)\n");
    assert.equal(readFileSync(join(dir, "data.json"), "utf8"), '{"to": "/docs/fleet/vnext"}\n');
    assert.deepEqual(rewriteSnapshotLinks(dir), [], "a second pass has nothing left to change");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("each docs instance names where its snapshots are written", () => {
  assert.deepEqual(
    docsInstances.map((i) => [i.id, i.snapshotsDir]),
    [
      ["default", "versioned_docs"],
      ["fleet", "fleet_versioned_docs"],
    ],
  );
});
