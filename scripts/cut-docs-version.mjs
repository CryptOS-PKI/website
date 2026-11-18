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
// Cuts the docs versions for the current release: snapshots each docs
// instance's Next (apps/docs/docs for CryptOS, apps/docs/fleet for FleetOS
// Manager) under its product's version in packages/frame/release.ts. Run it
// in the release's own PR, after the version bump, and commit what it writes.
// Each snapshot's links to the other docs' vNext are pointed at the released
// pages, since a build of released versions has no vNext.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { paths, readState, rewriteSnapshotLinks } from "./docs-version.mjs";

for (const { name, version, versions, cutCommand, versionsFile, snapshotsDir } of readState()) {
  if (versions.includes(version)) {
    console.log(`${name} docs version ${version} is already cut; nothing to do`);
    continue;
  }
  console.log(
    `cutting ${name} docs version ${version} (existing: ${versions.join(", ") || "none"})`,
  );
  execFileSync("npx", ["docusaurus", cutCommand, version], {
    cwd: new URL("../apps/docs/", import.meta.url),
    stdio: "inherit",
  });
  // The sources link the other docs' vNext; a released snapshot links the
  // released pages (see releasedLinks).
  const snapshot = fileURLToPath(new URL(`${snapshotsDir}/version-${version}`, paths.docs));
  const rewritten = rewriteSnapshotLinks(snapshot);
  console.log(`pointed the cross-links in ${rewritten.length} ${name} pages at the released docs`);
  console.log(
    `cut ${name} docs version ${version}: commit apps/docs/${versionsFile} and its snapshot`,
  );
}
