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
// The site's light and dark theme. Before the visitor answers the cookie
// choice, and after they decline, the site follows the system setting
// (prefers-color-scheme) and stores nothing; the switch only works once
// they've answered (packages/frame theme-pref.ts and consent.ts, under
// SITE_CONSENT_PREFIX). The theme lands on <html> twice: the kit's tokens
// switch on the "dark" class and the shared frame on data-theme, the
// attribute the docs set.
import { themeBootScript, type FrameTheme } from "@cryptos-pki/frame/theme-pref";

export const SITE_CONSENT_PREFIX = "cryptos-site";

export const pageTheme = (value: string | null): FrameTheme =>
  value === "light" ? "light" : "dark";

interface ThemeRoot {
  classList: { toggle: (name: string, on: boolean) => unknown };
  setAttribute: (name: string, value: string) => void;
  style: { colorScheme: string };
}

export function applyTheme(root: ThemeRoot, theme: FrameTheme) {
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

// Runs in <head> before the page paints: the visitor's stored choice once
// they've accepted, otherwise the system setting. It only reads storage.
export const themeInitScript = themeBootScript(SITE_CONSENT_PREFIX);
