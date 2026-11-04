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

import { vnextBannerText } from "./src/lib/vnext-banner.ts";
import { fleetRelease, release } from "../../packages/frame/release.ts";

test("the vNext banner names the upcoming and the current release", () => {
  assert.equal(
    vnextBannerText({ version: "v1.0.0", upcoming: "v1.1.0" }),
    "This page describes planned work, or work that may ship soon in v1.1.0. The current release is v1.0.0.",
  );
});

test("the banner reads both docs' versions from packages/frame/release.ts", () => {
  assert.match(vnextBannerText(release), new RegExp(`soon in ${release.upcoming}\\. The current release is ${release.version}\\.$`));
  assert.match(vnextBannerText(fleetRelease), new RegExp(`soon in ${fleetRelease.upcoming}\\.`));
});
