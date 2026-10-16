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

// Checks that every internal (same-site) href/src in the prerendered HTML
// output resolves to a real file. External links (http/https) are only
// counted, not fetched -- a network check in CI would be flaky and slow for
// no real safety gain on a handful of GitHub links.
//
// Usage: node scripts/check-links.mjs <built-site-dir>

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ATTR_RE = /\b(?:href|src)="([^"]+)"/g;

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(full)));
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

async function resolvesToFile(root, internalPath) {
  const [withoutHash] = internalPath.split("#");
  const clean = withoutHash.split("?")[0];
  if (clean === "") return true; // same-page "#fragment" link
  const relative = clean.startsWith("/") ? clean.slice(1) : clean;
  const candidate = path.join(root, relative);
  try {
    const st = await stat(candidate);
    if (st.isDirectory()) {
      await stat(path.join(candidate, "index.html"));
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const root = process.argv[2];
  if (!root) {
    console.error("usage: node scripts/check-links.mjs <built-site-dir>");
    process.exit(2);
  }

  const htmlFiles = await findHtmlFiles(root);
  if (htmlFiles.length === 0) {
    console.error(`no .html files found under ${root}`);
    process.exit(2);
  }

  let externalCount = 0;
  const broken = [];

  for (const file of htmlFiles) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(ATTR_RE)) {
      const link = match[1];
      if (/^(https?:|mailto:|tel:)/.test(link)) {
        externalCount += 1;
        continue;
      }
      if (link.startsWith("javascript:") || link.startsWith("data:")) continue;
      if (!link.startsWith("/")) continue; // relative asset links are resolved by the bundler already

      const ok = await resolvesToFile(root, link);
      if (!ok) broken.push({ file: path.relative(root, file), link });
    }
  }

  console.log(
    `checked ${htmlFiles.length} HTML file(s), ${externalCount} external link(s) (not fetched)`,
  );

  if (broken.length > 0) {
    console.error(`${broken.length} broken internal link(s):`);
    for (const { file, link } of broken) {
      console.error(`  ${file} -> ${link}`);
    }
    process.exit(1);
  }

  console.log("no broken internal links");
}

main();
