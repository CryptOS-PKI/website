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
import type {ReactNode} from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {ThemeToggle} from '@cryptos-pki/frame/theme-toggle';
import {pressThemeSwitch, type FrameTheme} from '@cryptos-pki/frame/theme-pref';
import {useBrowserConsent} from '@cryptos-pki/frame/use-consent';

import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';

// setColorMode takes a second argument its type leaves out: {persist: false}
// sets the colour mode without Docusaurus writing it to storage.
type SetColorMode = (mode: FrameTheme, options: {persist: boolean}) => void;

// The light and dark switch from packages/frame, the same button the site
// shows at the same spot, driven by Docusaurus's colour mode, which follows
// the system setting until the visitor picks a theme. Docusaurus never
// stores it; the pick goes to the consent store, which remembers it only
// after the visitor accepts (packages/frame theme-pref.ts). The phone menu repeats
// the header's items; the switch stays in the header there, so it renders
// nothing in the menu.
export function ThemeToggleNavbarItem({mobile}: {mobile?: boolean}): ReactNode {
  const {colorMode, setColorMode} = useColorMode();
  const {consent} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  if (mobile) return null;
  // Before the visitor answers the cookie choice a press only opens the
  // cookie bar; after that it flips the theme (stored only if they accepted).
  const press = () => {
    if (!consent) return;
    const next = pressThemeSwitch(consent, colorMode);
    if (next) (setColorMode as SetColorMode)(next, {persist: false});
  };
  return (
    <div className="navbar__item navbar__theme">
      <ThemeToggle
        theme={colorMode}
        onToggle={press}
      />
    </div>
  );
}
