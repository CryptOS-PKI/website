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
import { type Consent, consentKeys } from "./consent.ts";

// The light and dark choice, consent first, for both sites. Dark is the
// default. A pick is a preference in the consent store (consent.ts): before
// the visitor answers it lives in memory and asks for an answer, after they
// accept it's remembered on the machine, and after they decline it lasts for
// the page view only. Nothing here writes to storage itself. Framework-free:
// each site applies the theme to its page (the site's <html> classes,
// Docusaurus's colour mode) and calls chooseTheme.

export type FrameTheme = "dark" | "light";

export const THEME_PREF = "theme";

export function rememberedTheme(consent: Consent): FrameTheme {
  return consent.get(THEME_PREF) === "light" ? "light" : "dark";
}

export function chooseTheme(consent: Consent, theme: FrameTheme): void {
  consent.set(THEME_PREF, theme);
}

// An inline script that puts a remembered light theme on <html> before the
// first paint: the kit's "dark" class off, data-theme and Docusaurus's
// data-theme-choice set, and the colour scheme. It only reads, and only
// acts once the visitor has accepted. On the docs it has to run after
// Docusaurus's own theme script, which would otherwise reset data-theme.
export function themeBootScript(prefix?: string): string {
  const keys = consentKeys(prefix);
  return (
    `try{if(localStorage.getItem(${JSON.stringify(keys.consent)})==="accepted"&&` +
    `localStorage.getItem(${JSON.stringify(keys.pref(THEME_PREF))})==="light"){` +
    `var r=document.documentElement;r.classList.remove("dark");` +
    `r.setAttribute("data-theme","light");r.setAttribute("data-theme-choice","light");` +
    `r.style.colorScheme="light"}}catch(e){}`
  );
}
