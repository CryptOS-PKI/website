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
// Checks that a built site writes nothing to browser storage before the
// visitor accepts the cookie choice, and that the theme follows the
// visitor's system setting until they pick one. Each page loads in jsdom on
// a first visit (empty storage) with localStorage, sessionStorage and
// document.cookie watched, and prefers-color-scheme emulated; any write
// before consent fails the check.
//
// - Every page runs its inline scripts (the prerender level: the head
//   scripts and whatever the page runs before any bundle loads), once with
//   a light system setting and once with a dark one, and must show that
//   theme.
// - With --app=docs, a few pages also load the app bundles and hydrate, and
//   the check uses them as a visitor would. Before an answer: picking a tab
//   stores nothing and doesn't ask; pressing the theme switch opens the
//   cookie bar and leaves the theme alone; the full-width switch stores
//   nothing. After Decline: the theme switch flips the theme for the visit
//   and still stores nothing. After Accept (on a fresh load): the theme
//   switch flips the theme and the choice is stored, which proves the watch
//   works. (The site's bundles are ES modules, which jsdom can't run; the
//   site's switch goes through the same consent and theme code, tested in
//   packages/frame.)
//
//   node scripts/check-no-storage.mjs --app=<site|docs> <build dir>
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";

import { JSDOM, ResourceLoader, VirtualConsole } from "jsdom";

const ORIGIN = "https://example.test";

class BuildLoader extends ResourceLoader {
  constructor(root) {
    super();
    this.root = root;
  }

  fetch(url) {
    const target = new URL(url);
    const file = path.join(this.root, decodeURIComponent(target.pathname));
    if (target.origin !== ORIGIN || !existsSync(file) || statSync(file).isDirectory()) return null;
    return Promise.resolve(readFileSync(file));
  }
}

function watchStorage(window, writes, scheme) {
  const storage = window.Storage.prototype;
  const { setItem, removeItem, clear } = storage;
  const name = (store) => (store === window.sessionStorage ? "sessionStorage" : "localStorage");
  storage.setItem = function (key, value) {
    writes.push(`${name(this)}.setItem(${key})`);
    return setItem.call(this, key, value);
  };
  // Removing a key that isn't there stores nothing, so it isn't counted.
  storage.removeItem = function (key) {
    if (this.getItem(key) !== null) writes.push(`${name(this)}.removeItem(${key})`);
    return removeItem.call(this, key);
  };
  storage.clear = function () {
    if (this.length > 0) writes.push(`${name(this)}.clear()`);
    return clear.call(this);
  };
  Object.defineProperty(window.document, "cookie", {
    configurable: true,
    get: () => "",
    set: (value) => {
      writes.push(`document.cookie(${String(value).split("=")[0]})`);
    },
  });
  window.matchMedia = (query) => ({
    matches: query.includes(`prefers-color-scheme: ${scheme}`),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.ResizeObserver = window.IntersectionObserver;
  window.scrollTo = () => {};
}

// Loads one page. With `root`, the page's own bundles load from the build
// and the app hydrates; without, only its inline scripts run.
export async function loadPage(
  html,
  { file = "page.html", root, settleMs = 0, scheme = "dark" } = {},
) {
  const writes = [];
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => {
    if (!/Could not parse CSS stylesheet/.test(error.message)) errors.push(error.message);
  });
  const dom = new JSDOM(html, {
    url: `${ORIGIN}/${file.replace(/index\.html$/, "")}`,
    runScripts: "dangerously",
    resources: root ? new BuildLoader(root) : undefined,
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse: (window) => watchStorage(window, writes, scheme),
  });
  await new Promise((resolve) => {
    if (dom.window.document.readyState === "complete") resolve();
    else dom.window.addEventListener("load", resolve);
  });
  if (settleMs) await sleep(settleMs);
  return { dom, writes, errors };
}

export async function storageWritesIn(html, file, scheme = "dark") {
  const { dom, writes, errors } = await loadPage(html, { file, scheme });
  const theme = dom.window.document.documentElement.getAttribute("data-theme");
  dom.window.close();
  return {
    writes: writes.map((write) => `${file}: ${write}`),
    errors: errors.map((e) => `${file}: ${e}`),
    theme,
  };
}

const settle = (ms = 300) => sleep(ms);

const click = async (element) => {
  element?.click();
  await settle();
};

const theme = (document) => document.documentElement.getAttribute("data-theme");

const button = (document, label) =>
  [...document.querySelectorAll(".frame-consent__button")].find((b) => b.textContent === label);

// Uses a hydrated docs page the way a first-time visitor would, then again
// for a visitor who declines and one who accepts.
async function useDocsPage(root, file) {
  const problems = [];
  const fail = (message) => problems.push(`${file}: ${message}`);
  const html = readFileSync(path.join(root, file), "utf8");
  const open = (scheme) => loadPage(html, { file, root, settleMs: 1500, scheme });

  // First visit, light system setting: nothing asked, nothing stored.
  const first = await open("light");
  const doc = first.dom.window.document;
  if (!doc.querySelector(".theme-toggle")) fail("never hydrated (no theme switch)");
  if (theme(doc) !== "light") fail(`ignored a light system setting (showed ${theme(doc)})`);
  if (first.writes.length) fail(`wrote on load: ${first.writes.join(", ")}`);
  if (doc.querySelector(".frame-consent")) fail("the cookie bar shows before any switch is used");
  await click(doc.querySelector('[role="tab"]:not([aria-selected="true"])'));
  if (doc.querySelector(".frame-consent")) fail("picking a tab showed the cookie bar");
  await click(doc.querySelector(".theme-toggle"));
  if (theme(doc) !== "light") fail("the theme switch changed the theme before consent");
  if (!doc.querySelector(".frame-consent")) fail("the theme switch didn't open the cookie bar");
  await click(doc.querySelector(".width-toggle"));
  if (first.writes.length) fail(`wrote before consent: ${first.writes.join(", ")}`);

  // Decline: the switch now works for the visit, and still nothing is stored.
  await click(button(doc, "Decline"));
  if (doc.querySelector(".frame-consent")) fail("the cookie bar stayed after declining");
  await click(doc.querySelector(".theme-toggle"));
  if (theme(doc) !== "dark") fail("after declining, the theme switch didn't switch for the visit");
  if (first.writes.length) fail(`wrote after declining: ${first.writes.join(", ")}`);
  first.dom.window.close();

  // A fresh visit, dark system setting: accept, then the choice is stored.
  const second = await open("dark");
  const doc2 = second.dom.window.document;
  if (theme(doc2) !== "dark") fail(`ignored a dark system setting (showed ${theme(doc2)})`);
  await click(doc2.querySelector(".theme-toggle"));
  await click(button(doc2, "Accept"));
  if (doc2.querySelector(".frame-consent")) fail("the cookie bar stayed after accepting");
  await click(doc2.querySelector(".theme-toggle"));
  if (theme(doc2) !== "light") fail("after accepting, the theme switch didn't switch");
  const stored = second.writes.join(" ");
  for (const key of ["cryptos-docs:consent", "cryptos-docs:pref:theme"]) {
    if (!stored.includes(key)) fail(`accepting didn't store ${key} (the watch may be broken)`);
  }
  second.dom.window.close();
  return [...problems, ...[...first.errors, ...second.errors].map((error) => `${file}: ${error}`)];
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return htmlFiles(file);
    return name.endsWith(".html") ? [file] : [];
  });
}

// Docs pages that are used, not just loaded: the home, a CryptOS page with
// OS tabs, and a FleetOS Manager page.
const DOCS_PAGES_TO_USE = [
  "index.html",
  "docs/cryptos/using/setup/index.html",
  "docs/fleet/web-ui/index.html",
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = process.argv.find((arg) => arg.startsWith("--app="))?.slice("--app=".length);
  const root = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!root || !["site", "docs"].includes(app)) {
    console.error("usage: node scripts/check-no-storage.mjs --app=<site|docs> <build dir>");
    process.exit(2);
  }
  const problems = [];
  const files = htmlFiles(root);
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const name = path.relative(root, file);
    for (const scheme of ["light", "dark"]) {
      const result = await storageWritesIn(html, name, scheme);
      problems.push(...result.writes);
      // Redirect stubs carry no theme script; every real page does.
      if (html.includes("prefers-color-scheme: light") && result.theme !== scheme) {
        problems.push(`${name}: showed ${result.theme} with a ${scheme} system setting`);
      }
    }
  }
  console.log(`${app}: ran the inline scripts of ${files.length} page(s), light and dark`);
  if (app === "docs") {
    for (const file of DOCS_PAGES_TO_USE) {
      if (!existsSync(path.join(root, file))) {
        problems.push(`${file}: missing from the build`);
        continue;
      }
      problems.push(...(await useDocsPage(root, file)));
    }
    console.log(`docs: used ${DOCS_PAGES_TO_USE.length} hydrated page(s)`);
  }
  if (problems.length) {
    console.error(`storage check failed:\n${problems.slice(0, 50).join("\n")}`);
    process.exit(1);
  }
  console.log(`${app}: nothing is written to browser storage before consent`);
}
