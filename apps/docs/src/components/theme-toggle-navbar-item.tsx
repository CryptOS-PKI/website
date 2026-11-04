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

// The light and dark switch from packages/frame, the same button the site
// shows at the same spot, driven by Docusaurus's colour mode, which keeps the
// choice. The built-in switch is hidden (custom.css). The phone menu repeats
// the header's items; the switch stays in the header there, so it renders
// nothing in the menu.
export function ThemeToggleNavbarItem({mobile}: {mobile?: boolean}): ReactNode {
  const {colorMode, setColorMode} = useColorMode();
  if (mobile) return null;
  return (
    <div className="navbar__item navbar__theme">
      <ThemeToggle
        theme={colorMode}
        onToggle={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
      />
    </div>
  );
}
