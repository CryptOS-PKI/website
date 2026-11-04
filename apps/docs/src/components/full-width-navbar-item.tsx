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
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';
import {useConsent} from '@cryptos-pki/frame/use-consent';
import {isFullWidth, setFullWidth} from '@cryptos-pki/frame/full-width';
import {FullWidthToggle} from '@cryptos-pki/frame/full-width-toggle';

import {docsConsent} from '@site/src/lib/consent';

// The full-width switch from packages/frame, beside the version picker on
// doc pages only (either docs), so the docs home's header stays the site's.
// It reads the stored choice only once the page has hydrated, so the first
// render matches the prerendered page. The phone menu repeats the header's
// items; the content is already full width there, so it renders nothing.
export function FullWidthNavbarItem({mobile}: {mobile?: boolean}): ReactNode {
  const activePlugin = useActivePlugin();
  const isBrowser = useIsBrowser();
  const consent = isBrowser ? docsConsent() : null;
  useConsent(consent);
  if (mobile || !activePlugin) return null;
  const full = consent ? isFullWidth(consent) : false;
  return (
    <div className="navbar__item navbar__width">
      <FullWidthToggle
        full={full}
        onToggle={() => consent && setFullWidth(consent, !full, document.documentElement)}
      />
    </div>
  );
}
