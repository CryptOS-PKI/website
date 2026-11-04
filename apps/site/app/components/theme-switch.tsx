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
import { type FrameTheme, ThemeToggle } from "@cryptos-pki/frame/theme-toggle";
import { useSyncExternalStore } from "react";

import { applyTheme, nextTheme, storedTheme, THEME_KEY } from "~/theme";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getTheme = (): FrameTheme => storedTheme(document.documentElement.getAttribute("data-theme"));
const getServerTheme = (): FrameTheme => "dark";

function choose(theme: FrameTheme) {
  applyTheme(document.documentElement, theme);
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice still holds for this page view.
  }
  listeners.forEach((listener) => listener());
}

// The shared switch (packages/frame), wired to the site's theme on <html>.
export const ThemeSwitch = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  return <ThemeToggle theme={theme} onToggle={() => choose(nextTheme(theme))} />;
};
