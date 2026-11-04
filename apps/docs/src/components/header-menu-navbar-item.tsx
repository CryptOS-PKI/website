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
import type {FrameLink} from '@cryptos-pki/frame/content';
import {HeaderMenu} from '@cryptos-pki/frame/header-menu';

// The shared menu button from packages/frame, the same one the site shows
// after its theme switch: under the frame's breakpoint it holds the header
// links. It isn't a navbar__item, so Infima's phone rules don't hide it, and
// it renders nothing in Docusaurus's own phone menu.
export function HeaderMenuNavbarItem({links, mobile}: {links: FrameLink[]; mobile?: boolean}): ReactNode {
  if (mobile) return null;
  return <HeaderMenu links={links} />;
}
