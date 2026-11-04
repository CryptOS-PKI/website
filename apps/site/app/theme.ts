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
// The site's light and dark theme. Dark is the default, as on the docs. A
// choice is kept in localStorage under "theme", the key Docusaurus uses, and
// lands on <html> twice: the kit's tokens switch on the "dark" class and the
// shared frame on data-theme, the attribute the docs set.
import type { FrameTheme } from "@cryptos-pki/frame/theme-toggle";

export const THEME_KEY = "theme";

export const storedTheme = (value: string | null): FrameTheme =>
  value === "light" ? "light" : "dark";

export const nextTheme = (theme: FrameTheme): FrameTheme => (theme === "dark" ? "light" : "dark");

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

// Runs in <head> before the page paints, so a stored light choice never
// flashes dark first. Storage can be missing or blocked; dark stays then.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"){var r=document.documentElement;r.classList.remove("dark");r.setAttribute("data-theme","light");r.style.colorScheme="light";}}catch(e){}})();`;
