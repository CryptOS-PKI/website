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
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  buildPathFor,
  imageUrlsInCss,
  imageUrlsInHtml,
  missingImages,
  previewImageUrls,
} from "./check-images.mjs";

test("local image URLs are found in img, srcset, source, SVG image and CSS", () => {
  const html =
    '<img src="/b/img/a.svg"><img srcset="x.png 1x, /b/y.png 2x"><picture><source srcset="z.webp"></picture>' +
    '<svg><image href="i.png"/></svg><img src="https://example.com/a.png"><img src="data:image/png;base64,AA">';
  assert.deepEqual(imageUrlsInHtml(html), ["/b/img/a.svg", "x.png", "/b/y.png", "z.webp", "i.png"]);
  assert.deepEqual(
    imageUrlsInCss(
      "a{background:url('/b/i.svg')} b{background:url(data:x)} c{x:url(#m)} @font-face{src:url(/f.woff2)}",
    ),
    ["/b/i.svg"],
  );
});

test("a root path that skips the base path points outside the build", () => {
  assert.equal(buildPathFor("/img/a.svg", "/base/docs/x/index.html", "/base/"), null);
  assert.equal(buildPathFor("/base/img/a.svg", "/base/docs/x/index.html", "/base/"), "img/a.svg");
  assert.equal(buildPathFor("../a.svg", "/base/docs/x/index.html", "/base/"), "docs/a.svg");
});

test("a missing or misplaced image fails, a present one passes", () => {
  const root = mkdtempSync(path.join(tmpdir(), "images-"));
  mkdirSync(path.join(root, "img"));
  mkdirSync(path.join(root, "docs", "page"), { recursive: true });
  writeFileSync(path.join(root, "img", "ok.svg"), "<svg/>");
  writeFileSync(
    path.join(root, "docs", "page", "index.html"),
    '<img src="/base/img/ok.svg"><img src="/base/img/gone.svg"><img src="/img/ok.svg">',
  );
  assert.deepEqual(missingImages(root, "/base/"), [
    "docs/page/index.html: /base/img/gone.svg",
    "docs/page/index.html: /img/ok.svg (outside the base path /base/)",
  ]);
});

test("link-preview images on the site's own address are checked, others aren't", () => {
  const html =
    '<meta property="og:image" content="https://docs.example/base/img/card.png">' +
    '<meta name="twitter:image" content="https://cdn.example/x.png">' +
    "<meta data-rh=true name=twitter:image content=https://docs.example/base/img/t.png />" +
    "<meta data-rh=true property=og:image:alt content=https://docs.example/not-an-image />";
  assert.deepEqual(previewImageUrls(html, "https://docs.example"), [
    "/base/img/card.png",
    "/base/img/t.png",
  ]);
  assert.deepEqual(previewImageUrls(html, undefined), []);
});
