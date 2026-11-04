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
import { existsSync, readFileSync } from "node:fs";

// The docs version a release must ship: the release version in
// packages/frame/release.ts, the same one both sites show. Read as text so
// plain Node can run this without a TypeScript loader.
export function releaseVersion(source) {
  const match = source.match(/version:\s*"(v[^"]+)"/);
  if (!match) throw new Error("packages/frame/release.ts has no version");
  return match[1];
}

// The cut docs versions, newest first, from apps/docs/versions.json.
export function docsVersions(json) {
  if (json === undefined) return [];
  const versions = JSON.parse(json);
  if (!Array.isArray(versions) || versions.some((v) => typeof v !== "string")) {
    throw new Error("apps/docs/versions.json must be an array of version names");
  }
  return versions;
}

// Why a release can't deploy these docs, or null when it can: the release's
// version has to be cut and be the newest, so it's the default at /docs/.
export function docsVersionProblem(version, versions) {
  if (!versions.includes(version)) {
    return `the docs have no ${version} version: run "npm run docs:version" and merge it before publishing the release`;
  }
  if (versions[0] !== version) {
    return `${version} is cut but isn't the newest docs version (${versions[0]} is), so it wouldn't be the default`;
  }
  return null;
}

export const paths = {
  release: new URL("../packages/frame/release.ts", import.meta.url),
  versions: new URL("../apps/docs/versions.json", import.meta.url),
};

export function readState() {
  const version = releaseVersion(readFileSync(paths.release, "utf8"));
  const versions = docsVersions(
    existsSync(paths.versions) ? readFileSync(paths.versions, "utf8") : undefined,
  );
  return { version, versions };
}
