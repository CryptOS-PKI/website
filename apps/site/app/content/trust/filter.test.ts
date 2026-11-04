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

import {
  DEFAULT_VIEW,
  STATUSES,
  countByStatus,
  formatHash,
  parseHash,
  sortControls,
  toggleStatus,
  visibleControls,
} from "./filter.ts";
import type { Control } from "./types.ts";

const control = (id: string, area: string, status: Control["status"]): Control => ({
  id,
  area,
  title: id,
  statement: id,
  status,
  evidence: [],
});

const sample: Control[] = [
  control("ARC-1", "architecture", "implemented"),
  control("ARC-2", "architecture", "planned"),
  control("KEY-1", "keys", "partial"),
  control("KEY-2", "keys", "not-planned"),
  control("KEY-3", "keys", "implemented"),
];

test("the statuses run from implemented to not planned", () => {
  assert.deepEqual(STATUSES, ["implemented", "partial", "planned", "not-planned"]);
});

test("the default view shows every control in register order", () => {
  assert.deepEqual(DEFAULT_VIEW, { statuses: [], sort: "area" });
  assert.deepEqual(
    visibleControls(sample, DEFAULT_VIEW).map((c) => c.id),
    ["ARC-1", "ARC-2", "KEY-1", "KEY-2", "KEY-3"],
  );
});

test("counts cover every status, zero included", () => {
  assert.deepEqual(countByStatus(sample), {
    implemented: 2,
    partial: 1,
    planned: 1,
    "not-planned": 1,
  });
  assert.deepEqual(countByStatus([]), { implemented: 0, partial: 0, planned: 0, "not-planned": 0 });
});

test("a chip toggles its status on and off, keeping the status order", () => {
  const one = toggleStatus(DEFAULT_VIEW, "planned");
  assert.deepEqual(one.statuses, ["planned"]);
  const two = toggleStatus(one, "implemented");
  assert.deepEqual(two.statuses, ["implemented", "planned"]);
  assert.deepEqual(toggleStatus(two, "planned").statuses, ["implemented"]);
  assert.deepEqual(toggleStatus(toggleStatus(two, "planned"), "implemented"), DEFAULT_VIEW);
});

test("a filter shows only the chosen statuses", () => {
  const view = { statuses: ["partial", "planned"], sort: "area" } as const;
  assert.deepEqual(
    visibleControls(sample, { ...view, statuses: [...view.statuses] }).map((c) => c.id),
    ["ARC-2", "KEY-1"],
  );
});

test("sorting by status orders implemented first and keeps register order within a status", () => {
  assert.deepEqual(
    sortControls(sample, "status").map((c) => c.id),
    ["ARC-1", "KEY-3", "KEY-1", "ARC-2", "KEY-2"],
  );
  assert.deepEqual(
    sortControls(sample, "area").map((c) => c.id),
    sample.map((c) => c.id),
  );
});

test("the view round-trips through the URL hash", () => {
  const view = { statuses: ["implemented", "not-planned"], sort: "status" } as const;
  const hash = formatHash({ ...view, statuses: [...view.statuses] });
  assert.equal(hash, "#status=implemented,not-planned&sort=status");
  assert.deepEqual(parseHash(hash), { statuses: ["implemented", "not-planned"], sort: "status" });
  assert.equal(formatHash(DEFAULT_VIEW), "");
  assert.equal(formatHash({ statuses: ["planned"], sort: "area" }), "#status=planned");
});

test("a plain anchor, an empty hash or junk in the hash falls back to the default view", () => {
  assert.deepEqual(parseHash(""), DEFAULT_VIEW);
  assert.deepEqual(parseHash("#"), DEFAULT_VIEW);
  assert.deepEqual(parseHash("#area-keys"), DEFAULT_VIEW);
  assert.deepEqual(parseHash("#status=bogus,planned,planned&sort=sideways"), {
    statuses: ["planned"],
    sort: "area",
  });
});

test("parsed statuses come back in the status order, whatever order the link used", () => {
  assert.deepEqual(parseHash("#status=planned,implemented").statuses, ["implemented", "planned"]);
});
