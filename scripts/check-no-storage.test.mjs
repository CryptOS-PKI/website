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

import { loadPage, storageWritesIn } from "./check-no-storage.mjs";

test("a page whose head scripts only read storage passes", async () => {
  const html =
    '<html><head><script>try{if(localStorage.getItem("a")==="b")document.documentElement.setAttribute("data-x","y")}catch(e){}</script></head></html>';
  assert.deepEqual((await storageWritesIn(html, "page.html")).writes, []);
});

test("a page script that writes localStorage, sessionStorage or a cookie is caught", async () => {
  for (const write of [
    'localStorage.setItem("theme","dark")',
    'window.sessionStorage.setItem("k","v")',
    'document.cookie="a=b"',
    'localStorage.setItem("x","1");localStorage.removeItem("x")',
  ]) {
    const { writes } = await storageWritesIn(`<script>${write}</script>`, "page.html");
    assert.ok(writes.length >= 1, write);
  }
});

test("removing a key that isn't there doesn't count as a write", async () => {
  const { writes } = await storageWritesIn(
    '<script>localStorage.removeItem("theme")</script>',
    "page.html",
  );
  assert.deepEqual(writes, []);
});

test("inline scripts really run, so a reading script can act", async () => {
  const { dom } = await loadPage(
    '<html><body><script>document.documentElement.setAttribute("data-ran","yes")</script></body></html>',
  );
  assert.equal(dom.window.document.documentElement.getAttribute("data-ran"), "yes");
  dom.window.close();
});
