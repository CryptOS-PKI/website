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

import { fleetos } from "../fleetos.ts";
import { areas, controls } from "./controls.ts";
import { STATUSES } from "./filter.ts";
import { evidenceHref, statusLabel } from "./links.ts";
import { review } from "./review.ts";
import { trustCenter } from "./trust-center.ts";
import { PUBLIC_REPOS, type Block } from "./types.ts";

const allText = JSON.stringify({ areas, controls, review, trustCenter, fleetos });

const figures = review.sections
  .flatMap((s) => s.blocks)
  .filter((b): b is Extract<Block, { kind: "figure" }> => b.kind === "figure");

test("control ids are unique and every control sits in a known area", () => {
  const ids = controls.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  const areaIds = new Set(areas.map((a) => a.id));
  for (const c of controls) assert.ok(areaIds.has(c.area), `${c.id} has unknown area ${c.area}`);
  for (const a of areas)
    assert.ok(
      controls.some((c) => c.area === a.id),
      `area ${a.id} is empty`,
    );
});

test("every status has at least one control, so every chip filters to something", () => {
  for (const s of STATUSES)
    assert.ok(
      controls.some((c) => c.status === s),
      `no ${s} control`,
    );
});

test("an implemented or partial control names its evidence, and its tag when it has one", () => {
  for (const c of controls.filter((c) => c.status === "implemented" || c.status === "partial")) {
    assert.ok(c.evidence.length > 0, `${c.id} needs evidence`);
    if (c.since) assert.match(c.since, /^v\d+\.\d+\.\d+(-rc\.\d+)?$/, `${c.id} has a bad tag`);
  }
});

test("a planned control links the open issue or the public roadmap that tracks it", () => {
  for (const c of controls.filter((c) => c.status === "planned")) {
    const roadmap = c.evidence.some((e) => e.path.endsWith("status-roadmap.md"));
    assert.ok(c.gaps?.length || roadmap, `${c.id} is planned with nothing tracking it`);
    assert.equal(c.since, undefined, `${c.id} is planned but names a release`);
  }
});

test("a not-planned control says why and points at where that is written down", () => {
  for (const c of controls.filter((c) => c.status === "not-planned")) {
    assert.ok(c.reason && c.reason.length > 20, `${c.id} needs a reason`);
    assert.ok(c.evidence.length > 0, `${c.id} needs a public source`);
  }
  for (const c of controls.filter((c) => c.status !== "not-planned")) {
    assert.equal(c.reason, undefined, `${c.id} has a reason but isn't a non-goal`);
  }
});

test("every evidence and issue link points at a public repo's main branch", () => {
  const allowed = new Set<string>(PUBLIC_REPOS);
  for (const c of controls) {
    for (const e of c.evidence) {
      assert.ok(allowed.has(e.repo), `${c.id} cites ${e.repo}`);
      assert.match(evidenceHref(e), /^https:\/\/github\.com\/CryptOS-PKI\/[^/]+\/blob\/main\/\S+$/);
    }
    for (const g of c.gaps ?? []) assert.ok(allowed.has(g.repo), `${c.id} links ${g.repo}`);
  }
});

test("the badge names the release only where the control shipped in one", () => {
  assert.equal(
    statusLabel({ status: "implemented", since: "v0.1.0-rc.1" }),
    "Implemented in v0.1.0-rc.1",
  );
  assert.equal(statusLabel({ status: "implemented" }), "Implemented");
  assert.equal(statusLabel({ status: "planned" }), "Planned");
  assert.equal(statusLabel({ status: "not-planned" }), "Not planned");
});

test("every review section's areas exist and every area appears in the review", () => {
  const areaIds = new Set(areas.map((a) => a.id));
  const used = new Set(review.sections.flatMap((s) => s.areas ?? []));
  for (const id of used) assert.ok(areaIds.has(id), `review cites unknown area ${id}`);
  for (const id of areaIds) assert.ok(used.has(id), `area ${id} is missing from the review`);
});

test("the review numbers its four figures in order, each drawn once", () => {
  assert.deepEqual(
    figures.map((f) => [f.number, f.diagram]),
    [
      [1, "architecture"],
      [2, "appliance-hld"],
      [3, "boot-chain"],
      [4, "fleet"],
    ],
  );
  for (const f of trustCenter.architecture.figures) {
    const same = figures.find((r) => r.diagram === f.diagram);
    assert.equal(f.number, same?.number, `${f.diagram} is numbered differently on the two pages`);
  }
});

test("the content claims no certification", () => {
  assert.doesNotMatch(
    allText,
    /\b(is|are|been|fully) (SOC 2|ISO 27001)[ -](certified|compliant|audited)/i,
  );
  assert.doesNotMatch(allText, /\bcertified\b/i);
});

test("the content claims nothing the code doesn't do", () => {
  // The design once had nodes enrol themselves with a TPM EK quote, a 90-day
  // manager-issued peer certificate, PCR 14 extensions and dm-verity. None of
  // it is built, so none of it may appear as fact.
  assert.doesNotMatch(
    allText,
    /EnrollNode|\bEK\b|endorsement key|peer cert|PCR 14|dm-verity|keepalived/i,
  );
  assert.doesNotMatch(allText, /can'?t sign|cannot sign/i);
});

test("the content carries no emoji, private addresses or deployment details", () => {
  assert.doesNotMatch(allText, /[\p{Emoji_Presentation}\u{FE0F}]/u);
  assert.doesNotMatch(
    allText,
    /\b(10|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  );
  assert.doesNotMatch(allText, /\b[a-z0-9-]+\.(local|internal|lan|corp)\b/i);
  assert.doesNotMatch(allText, /\bplan\//);
});

test("FleetOS Manager features not on a published tag say so", () => {
  const next = [
    ...fleetos.whatItIs.items,
    ...fleetos.approvals.items,
    ...fleetos.issuing.items,
    ...fleetos.run.items,
    ...fleetos.storage.modes,
  ].filter((i) => "next" in i && i.next);
  assert.ok(next.length > 0);
  assert.equal(fleetos.console.cli.next, true, "cryptos-managerctl ships after v0.1.0-rc.1");
  assert.ok(fleetos.storage.modes.find((m) => m.mode.startsWith("Key-value"))?.next);
});
