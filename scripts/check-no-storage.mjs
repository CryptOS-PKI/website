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
// visitor accepts the cookie choice. Each page loads in jsdom on a first
// visit (empty storage) with localStorage, sessionStorage and
// document.cookie watched; any write fails the check.
//
// - Every page runs its inline scripts (the prerender level: the head
//   scripts and whatever the page runs before any bundle loads).
// - With --app=docs, a few pages also load the app bundles and hydrate, and
//   the check then uses the page: it flips the theme, the full-width switch
//   and a tab group, and expects no writes and the cookie bar showing. Then
//   it accepts, and expects the choices stored, which proves the watch
//   works. (The site's bundles are ES modules, which jsdom can't run; the
//   site's switch goes through the same consent store, tested in
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

function watchStorage(window, writes) {
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
  window.matchMedia = () => ({
    matches: true,
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
export async function loadPage(html, { file = "page.html", root, settleMs = 0 } = {}) {
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
    beforeParse: (window) => watchStorage(window, writes),
  });
  await new Promise((resolve) => {
    if (dom.window.document.readyState === "complete") resolve();
    else dom.window.addEventListener("load", resolve);
  });
  if (settleMs) await sleep(settleMs);
  return { dom, writes, errors };
}

export async function storageWritesIn(html, file) {
  const { dom, writes, errors } = await loadPage(html, { file });
  dom.window.close();
  return {
    writes: writes.map((write) => `${file}: ${write}`),
    errors: errors.map((e) => `${file}: ${e}`),
  };
}

const settle = (ms = 300) => sleep(ms);

// Uses a hydrated docs page the way a first-time visitor would.
async function useDocsPage(root, file) {
  const problems = [];
  const { dom, writes, errors } = await loadPage(readFileSync(path.join(root, file), "utf8"), {
    file,
    root,
    settleMs: 1500,
  });
  const { document } = dom.window;
  const fail = (message) => problems.push(`${file}: ${message}`);
  if (!document.querySelector(".theme-toggle")) fail("never hydrated (no theme switch)");
  if (writes.length) fail(`wrote on load: ${writes.join(", ")}`);
  if (document.querySelector(".frame-consent"))
    fail("the cookie bar shows before any switch is used");

  for (const tab of document.querySelectorAll('[role="tab"]:not([aria-selected="true"])')) {
    tab.click();
    break;
  }
  await settle();
  if (document.querySelector(".frame-consent")) fail("picking a tab showed the cookie bar");

  document.querySelector(".theme-toggle")?.click();
  await settle();
  if (document.documentElement.getAttribute("data-theme") !== "light")
    fail("the theme switch didn't switch");
  if (!document.querySelector(".frame-consent"))
    fail("the cookie bar didn't show after the theme switch");
  document.querySelector(".width-toggle")?.click();
  await settle();
  if (writes.length) fail(`wrote before consent: ${writes.join(", ")}`);

  const accept = [...document.querySelectorAll(".frame-consent__button")].find(
    (button) => button.textContent === "Accept",
  );
  accept?.click();
  await settle();
  const stored = writes.join(" ");
  for (const key of ["cryptos-docs:consent", "cryptos-docs:pref:theme"]) {
    if (!stored.includes(key)) fail(`accepting didn't store ${key} (the watch may be broken)`);
  }
  if (document.querySelector(".frame-consent")) fail("the cookie bar stayed after accepting");
  dom.window.close();
  return [...problems, ...errors.map((error) => `${file}: ${error}`)];
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
    const result = await storageWritesIn(readFileSync(file, "utf8"), path.relative(root, file));
    problems.push(...result.writes);
  }
  console.log(`${app}: ran the inline scripts of ${files.length} page(s)`);
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
