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

import { oldDocsPaths } from "./redirects.ts";

test("the CryptOS docs keep their old paths, released and vNext (once Next)", () => {
  assert.deepEqual(oldDocsPaths("/docs/cryptos"), ["/docs"]);
  assert.deepEqual(oldDocsPaths("/docs/cryptos/concepts/ca-roles"), ["/docs/concepts/ca-roles"]);
  assert.deepEqual(oldDocsPaths("/docs/cryptos/vnext"), ["/docs/next", "/docs/cryptos/next"]);
  assert.deepEqual(oldDocsPaths("/docs/cryptos/vnext/using/setup"), [
    "/docs/next/using/setup",
    "/docs/cryptos/next/using/setup",
  ]);
});

test("the FleetOS Manager docs answer at the old fleet-manager paths", () => {
  assert.deepEqual(oldDocsPaths("/docs/fleet"), ["/docs/fleet-manager/overview"]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/approvals"), ["/docs/fleet-manager/approvals"]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/first-run"), ["/docs/fleet-manager/first-run"]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/vnext"), [
    "/docs/next/fleet-manager/overview",
    "/docs/fleet/next",
  ]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/"), ["/docs/fleet-manager/overview"]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/vnext/"), [
    "/docs/next/fleet-manager/overview",
    "/docs/fleet/next/",
  ]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/vnext/web-ui"), [
    "/docs/next/fleet-manager/web-ui",
    "/docs/fleet/next/web-ui",
  ]);
});

test("pages that moved into the FleetOS Manager docs from other sections keep their old paths", () => {
  assert.deepEqual(oldDocsPaths("/docs/fleet/reference/cryptos-managerctl"), [
    "/docs/reference/cryptos-managerctl",
  ]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/vnext/reference/cryptos-managerctl"), [
    "/docs/next/reference/cryptos-managerctl",
    "/docs/fleet/next/reference/cryptos-managerctl",
  ]);
  assert.deepEqual(oldDocsPaths("/docs/fleet/contributing/ui-issue-button"), [
    "/docs/contributing/ui-issue-button",
  ]);
});

test("paths outside the two docs get no redirect", () => {
  assert.deepEqual(oldDocsPaths("/"), []);
  assert.deepEqual(oldDocsPaths("/search"), []);
  assert.deepEqual(oldDocsPaths("/docs/cryptosx"), []);
  assert.deepEqual(oldDocsPaths("/docs/fleetwood/x"), []);
});
