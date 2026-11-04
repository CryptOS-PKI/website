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
import { pressThemeSwitch, rememberedTheme } from "@cryptos-pki/frame/theme-pref";
import { type FrameTheme, ThemeToggle } from "@cryptos-pki/frame/theme-toggle";
import { useBrowserConsent } from "@cryptos-pki/frame/use-consent";
import { useEffect, useSyncExternalStore } from "react";

import { applyTheme, pageTheme, SITE_CONSENT_PREFIX } from "~/theme";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getTheme = (): FrameTheme => pageTheme(document.documentElement.getAttribute("data-theme"));
const getServerTheme = (): FrameTheme => "dark";

function show(theme: FrameTheme) {
  applyTheme(document.documentElement, theme);
  listeners.forEach((listener) => listener());
}

// The shared switch (packages/frame), wired to the site's theme on <html>.
// Before the visitor answers the cookie choice a press only opens the cookie
// bar; after that it flips the theme (stored only if they accepted). Until
// the visitor picks a theme of their own, the page follows the system
// setting, live.
export const ThemeSwitch = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const { consent } = useBrowserConsent(SITE_CONSENT_PREFIX);

  useEffect(() => {
    if (!consent) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const follow = () => {
      if (rememberedTheme(consent) === null) show(query.matches ? "light" : "dark");
    };
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, [consent]);

  const press = () => {
    if (!consent) return;
    const next = pressThemeSwitch(consent, theme);
    if (next) show(next);
  };
  return <ThemeToggle theme={theme} onToggle={press} />;
};
