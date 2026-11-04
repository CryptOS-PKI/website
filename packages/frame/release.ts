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
// The current CryptOS release, the one version both sites show: the site's
// release strip and download links read it, and it is the docs version a
// release deploys, so apps/docs/versions.json must list it before a release
// can go out. `upcoming` is the release being built, named on every vNext
// docs page.
export const release = {
  version: "v0.1.0-rc.1",
  upcoming: "v0.1.0-rc.2",
  kind: "prerelease" as const,
  publishedOn: "2026-10-24",
};

// The current FleetOS Manager release, the version the FleetOS Manager docs
// (/docs/fleet) follow, so apps/docs/fleet_versions.json must list it before
// a release can go out. It ships alongside CryptOS today, so the two match,
// but each docs instance follows its own product.
export const fleetRelease = {
  version: "v0.1.0-rc.1",
  upcoming: "v0.1.0-rc.2",
};
