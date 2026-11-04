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
// Fails on any image a built page points at that isn't in the build: every
// <img> src and srcset, <source> srcset, SVG <image> href and every image
// a stylesheet's url() names, on every page of both docs instances and every version. Built with
// a base path (PREVIEW_BASE_PATH), it also catches an image written with a
// root path that skips the base (for example '/img/...' instead of
// useBaseUrl('/img/...')), since that path then points outside the build.
//
// With --site-url, the link-preview images (og:image, twitter:image) on that
// address are checked too.
//
//   node scripts/check-images.mjs <build dir> [--base=/sub/path/] [--site-url=https://...]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ATTRIBUTE =
  /<(?:img|source|image)\b[^>]*?\s(src|srcset|href|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi;

const META_IMAGE =
  /<meta\b[^>]*?\b(?:property|name)\s*=\s*["']?(?:og:image|twitter:image)["']?[\s/][^>]*?\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

// The link-preview images (og:image, twitter:image), which are absolute URLs
// on the site's own address; given that address, they're checked like any
// local image.
export function previewImageUrls(html, siteUrl) {
  if (!siteUrl) return [];
  const origin = new URL(siteUrl).origin;
  return [...html.matchAll(META_IMAGE)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter((url) => url.startsWith(`${origin}/`))
    .map((url) => new URL(url).pathname);
}

const isLocal = (url) => url && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

export function imageUrlsInHtml(html) {
  const urls = [];
  for (const match of html.matchAll(ATTRIBUTE)) {
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    const parts =
      match[1].toLowerCase() === "srcset"
        ? value.split(",").map((part) => part.trim().split(/\s+/)[0])
        : [value];
    urls.push(...parts.filter(isLocal));
  }
  return urls;
}

const IMAGE_FILE = /\.(?:png|jpe?g|gif|svg|webp|avif|ico)(?:[?#].*)?$/i;

// Images only: a stylesheet's fonts aren't this check's business.
export function imageUrlsInCss(css) {
  return [...css.matchAll(CSS_URL)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter((url) => isLocal(url) && IMAGE_FILE.test(url));
}

// Where a URL used on a page (at pagePath, under base) lands in the build,
// or null when it points outside the base.
export function buildPathFor(url, pagePath, base) {
  const resolved = new URL(url, `https://build.invalid${pagePath}`).pathname;
  if (!resolved.startsWith(base)) return null;
  return decodeURIComponent(resolved.slice(base.length));
}

function files(dir, ext) {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return files(file, ext);
    return name.endsWith(ext) ? [file] : [];
  });
}

export function missingImages(root, base = "/", siteUrl = undefined) {
  const missing = [];
  const check = (url, from, pagePath) => {
    const target = buildPathFor(url, pagePath, base);
    if (target === null) missing.push(`${from}: ${url} (outside the base path ${base})`);
    else if (!existsSync(path.join(root, target))) missing.push(`${from}: ${url}`);
  };
  for (const file of files(root, ".html")) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    const pagePath = base + rel;
    const html = readFileSync(file, "utf8");
    for (const url of [...imageUrlsInHtml(html), ...previewImageUrls(html, siteUrl)]) {
      check(url, rel, pagePath);
    }
  }
  for (const file of files(root, ".css")) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    for (const url of imageUrlsInCss(readFileSync(file, "utf8"))) check(url, rel, base + rel);
  }
  return missing;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const base =
    process.argv.find((arg) => arg.startsWith("--base="))?.slice("--base=".length) ?? "/";
  if (!root) {
    console.error("usage: node scripts/check-images.mjs <build dir> [--base=/sub/path/]");
    process.exit(2);
  }
  const siteUrl = process.argv
    .find((arg) => arg.startsWith("--site-url="))
    ?.slice("--site-url=".length);
  const missing = missingImages(root, base.endsWith("/") ? base : `${base}/`, siteUrl);
  if (missing.length) {
    console.error(`${missing.length} missing image(s):\n${missing.slice(0, 50).join("\n")}`);
    process.exit(1);
  }
  console.log(`every image the pages in ${root} use is in the build (base ${base})`);
}
