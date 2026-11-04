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
// Which apps a change touches, so CI builds only those. A change under
// apps/site or apps/docs builds that app; anything else (the shared
// packages, the root manifests, the workflows, these scripts) builds both,
// since both apps depend on it. Docs-only files at the root (README and the
// like) build neither.
//
//   node scripts/changed-apps.mjs <base> <head>
//
// prints site_changed=<bool> and docs_changed=<bool> lines for $GITHUB_OUTPUT. With no base
// (a push, a merge group), it builds both.
import { execFileSync } from "node:child_process";

const ROOT_DOCS = /^(README|AGENTS|CLAUDE)\.md$|^(LICENSE|NOTICE|AUTHORS)$|^docs\/[^/]+\.md$/;

export function changedApps(files) {
  let siteChanged = false;
  let docsChanged = false;
  for (const file of files) {
    if (file.startsWith("apps/site/")) siteChanged = true;
    else if (file.startsWith("apps/docs/")) docsChanged = true;
    else if (!ROOT_DOCS.test(file)) {
      siteChanged = true;
      docsChanged = true;
    }
  }
  return { siteChanged, docsChanged };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [base, head] = process.argv.slice(2);
  let result = { siteChanged: true, docsChanged: true };
  if (base && head) {
    const files = execFileSync("git", ["diff", "--name-only", `${base}...${head}`], {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
    console.error(`${files.length} changed file(s) between ${base} and ${head}`);
    result = changedApps(files);
  } else {
    console.error("no base to compare with: building both apps");
  }
  console.log(`site_changed=${result.siteChanged}`);
  console.log(`docs_changed=${result.docsChanged}`);
}
