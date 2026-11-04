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

// The docs site has two docs instances, each versioned on its own and each
// following its own product's release: CryptOS at /docs/cryptos (the
// default instance, versions.json) and FleetOS Manager at /docs/fleet
// (fleet_versions.json). Their release versions live in
// packages/frame/release.ts, `release` for CryptOS and `fleetRelease` for
// FleetOS Manager.
export const docsInstances = [
  {
    id: "default",
    name: "CryptOS",
    releaseExport: "release",
    versionsFile: "versions.json",
    cutCommand: "docs:version",
  },
  {
    id: "fleet",
    name: "FleetOS Manager",
    releaseExport: "fleetRelease",
    versionsFile: "fleet_versions.json",
    cutCommand: "docs:version:fleet",
  },
];

// A product's release version from packages/frame/release.ts, read as text
// so plain Node can run this without a TypeScript loader.
export function releaseVersion(source, exportName) {
  const match = source.match(
    new RegExp(`export const ${exportName}\\s*=\\s*\\{[^}]*?version:\\s*"(v[^"]+)"`),
  );
  if (!match) throw new Error(`packages/frame/release.ts has no ${exportName} version`);
  return match[1];
}

// The cut docs versions of one instance, newest first.
export function docsVersions(json) {
  if (json === undefined) return [];
  const versions = JSON.parse(json);
  if (!Array.isArray(versions) || versions.some((v) => typeof v !== "string")) {
    throw new Error("a docs versions file must be an array of version names");
  }
  return versions;
}

// Why a release can't deploy these docs, or null when it can: the release's
// version has to be cut and be the newest, so it's the default.
export function docsVersionProblem(version, versions, name) {
  if (!versions.includes(version)) {
    return `the ${name} docs have no ${version} version: run "npm run docs:version" and merge it before publishing the release`;
  }
  if (versions[0] !== version) {
    return `${version} is cut in the ${name} docs but isn't the newest version there (${versions[0]} is), so it wouldn't be the default`;
  }
  return null;
}

export const paths = {
  release: new URL("../packages/frame/release.ts", import.meta.url),
  docs: new URL("../apps/docs/", import.meta.url),
};

// Each instance with its release version and its cut versions.
export function readState() {
  const source = readFileSync(paths.release, "utf8");
  return docsInstances.map((instance) => {
    const file = new URL(instance.versionsFile, paths.docs);
    return {
      ...instance,
      version: releaseVersion(source, instance.releaseExport),
      versions: docsVersions(existsSync(file) ? readFileSync(file, "utf8") : undefined),
    };
  });
}
