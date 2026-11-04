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
// Cuts the docs version for the current release: snapshots apps/docs/docs
// (Next) into apps/docs/versioned_docs under the version in
// packages/frame/release.ts. Run it in the release's own PR, after the
// version bump, and commit what it writes.
import { execFileSync } from "node:child_process";

import { readState } from "./docs-version.mjs";

const { version, versions } = readState();
if (versions.includes(version)) {
  console.log(`docs version ${version} is already cut; nothing to do`);
  process.exit(0);
}
console.log(`cutting docs version ${version} (existing: ${versions.join(", ") || "none"})`);
execFileSync("npx", ["docusaurus", "docs:version", version], {
  cwd: new URL("../apps/docs/", import.meta.url),
  stdio: "inherit",
});
console.log(
  `cut docs version ${version}: commit apps/docs/versions.json, versioned_docs/ and versioned_sidebars/`,
);
