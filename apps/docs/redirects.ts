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
// Before the split, every page lived in one docs tree at /docs/<page>
// (released) and /docs/next/<page> (Next). Now CryptOS answers at
// /docs/cryptos and FleetOS Manager at /docs/fleet, each with its own
// versions. Given a page's new path, this returns the old paths that should
// still reach it, so links already out there (the console's help links among
// them) keep working. Used as @docusaurus/plugin-client-redirects'
// createRedirects.

// Pages that came into the FleetOS Manager docs from other sections keep
// their path below the version; everything else came from fleet-manager/.
const fleetPagesFromElsewhere = ["/reference/cryptos-managerctl", "/contributing/"];

const instancePath = (path: string, base: string): string | null => {
  if (path === base) return "";
  return path.startsWith(`${base}/`) ? path.slice(base.length) : null;
};

const splitVersion = (rest: string): {version: string; page: string} =>
  rest === "/next" || rest.startsWith("/next/")
    ? {version: "/next", page: rest.slice("/next".length)}
    : {version: "", page: rest};

export function oldDocsPaths(path: string): string[] {
  const cryptos = instancePath(path, "/docs/cryptos");
  if (cryptos !== null) return [`/docs${cryptos}`];

  const fleet = instancePath(path, "/docs/fleet");
  if (fleet === null) return [];
  const {version, page} = splitVersion(fleet);
  if (page === "" || page === "/") return [`/docs${version}/fleet-manager/overview`];
  if (fleetPagesFromElsewhere.some((prefix) => page.startsWith(prefix))) return [`/docs${version}${page}`];
  return [`/docs${version}/fleet-manager${page}`];
}
