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
import { readFileSync } from "node:fs";
import { test } from "node:test";

const file = (name: string) => readFileSync(new URL(`./public/${name}`, import.meta.url));

test("the apple-touch-icon is a 180x180 PNG", () => {
  const png = file("apple-touch-icon.png");
  assert.deepEqual([...png.subarray(1, 4)], [0x50, 0x4e, 0x47], "not a PNG");
  assert.equal(png.readUInt32BE(16), 180, "width");
  assert.equal(png.readUInt32BE(20), 180, "height");
});

test("the marks and the favicon are SVGs", () => {
  for (const name of [
    "favicon.svg",
    "img/brand/cryptos-mark-light.svg",
    "img/brand/cryptos-mark-dark.svg",
    "img/brand/fleetos-mark-light.svg",
    "img/brand/fleetos-mark-dark.svg",
  ]) {
    assert.match(file(name).toString("utf8"), /<svg[\s>]/, `${name} is not an SVG`);
  }
});
