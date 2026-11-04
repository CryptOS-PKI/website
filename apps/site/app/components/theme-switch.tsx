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
import { useBrowserConsent } from "@cryptos-pki/frame/use-consent";
import { chooseTheme } from "@cryptos-pki/frame/theme-pref";
import { type FrameTheme, ThemeToggle } from "@cryptos-pki/frame/theme-toggle";
import { useSyncExternalStore } from "react";

import { applyTheme, nextTheme, pageTheme, SITE_CONSENT_PREFIX } from "~/theme";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getTheme = (): FrameTheme => pageTheme(document.documentElement.getAttribute("data-theme"));
const getServerTheme = (): FrameTheme => "dark";

// The shared switch (packages/frame), wired to the site's theme on <html>.
// The pick goes to the consent store, which keeps it in memory and asks the
// visitor whether to remember it; nothing is stored before they accept.
export const ThemeSwitch = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const { consent } = useBrowserConsent(SITE_CONSENT_PREFIX);
  const choose = (next: FrameTheme) => {
    applyTheme(document.documentElement, next);
    if (consent) chooseTheme(consent, next);
    listeners.forEach((listener) => listener());
  };
  return <ThemeToggle theme={theme} onToggle={() => choose(nextTheme(theme))} />;
};
