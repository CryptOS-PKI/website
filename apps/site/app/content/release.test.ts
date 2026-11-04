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

import { downloads, installTargets, kubernetes, release, verify } from "./release.ts";

const tagBase = "https://github.com/CryptOS-PKI/cryptos-appliance/releases";

test("the Releases page names the current release and links its GitHub release", () => {
  assert.match(release.version, /^v\d+\.\d+\.\d+(-rc\.\d+)?$/);
  assert.equal(release.pageHref, `${tagBase}/tag/${release.version}`);
});

test("every download points at the current release's tag and ends with its own name", () => {
  const prefix = `${tagBase}/download/${release.version}/`;
  for (const asset of downloads) {
    assert.ok(asset.href.startsWith(prefix), `${asset.name} does not point at ${release.version}`);
    assert.ok(
      asset.href.endsWith(`/${asset.name}`),
      `${asset.name}'s href does not end with its name`,
    );
  }
});

test("every download has a positive size and a unique name", () => {
  const seen = new Set<string>();
  for (const asset of downloads) {
    assert.ok(asset.sizeBytes > 0, `${asset.name} has no size`);
    assert.ok(!seen.has(asset.name), `${asset.name} is listed twice`);
    seen.add(asset.name);
  }
});

test("the images are the unsigned ones, both state-key variants, with SHA256SUMS", () => {
  const names = downloads.map((asset) => asset.name);
  const isos = names.filter((name) => name.endsWith(".iso"));
  assert.equal(isos.length, 2);
  assert.ok(
    isos.every((name) => name.includes("unsigned")),
    "every ISO is the unsigned build",
  );
  assert.ok(
    isos.some((name) => name.includes("nodeid")),
    "the nodeid ISO is listed",
  );
  assert.ok(names.includes("SHA256SUMS"));
});

test("cryptosctl is listed for Linux and macOS on amd64 and arm64", () => {
  const cli = downloads
    .filter((asset) => asset.name.startsWith("cryptosctl-"))
    .map((asset) => asset.name);
  for (const platform of ["linux-amd64", "linux-arm64", "darwin-amd64", "darwin-arm64"]) {
    assert.ok(
      cli.some((name) => name.startsWith(`cryptosctl-${platform}-`)),
      platform,
    );
  }
});

test("only an available install target links a guide", () => {
  for (const target of installTargets) {
    if (target.status === "Available") {
      assert.ok(target.guideHref?.startsWith("https://"), `${target.id} has no guide link`);
    } else {
      assert.equal(target.guideHref, undefined, `${target.id} isn't out, so it links nothing`);
    }
  }
});

test("the FleetOS Manager chart and image are the release's own", () => {
  assert.equal(kubernetes.chart, "oci://ghcr.io/cryptos-pki/charts/fleet-manager");
  assert.equal(kubernetes.chartVersion, release.version.slice(1));
  assert.equal(kubernetes.image, `ghcr.io/cryptos-pki/cryptos-manager:${release.version}`);
});

test("the verify step checks the published sums", () => {
  assert.equal(verify.command, "sha256sum -c SHA256SUMS --ignore-missing");
});
