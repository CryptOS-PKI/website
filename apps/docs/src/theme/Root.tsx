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
import {ConsentBanner} from '@cryptos-pki/frame/consent-banner';
import {useBrowserConsent} from '@cryptos-pki/frame/use-consent';

import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';

// Wraps every page so the cookie choice (packages/frame) can show on any of
// them. It only shows once a visitor changes a setting that could be
// remembered (the theme or the full-width switch) without having answered
// yet.
export default function Root({children}: {children: ReactNode}): ReactNode {
  const {consent, asking} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  return (
    <>
      {children}
      {consent && asking && <ConsentBanner onAccept={consent.accept} onDecline={consent.decline} />}
    </>
  );
}
