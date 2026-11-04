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
import TabsOriginal from '@theme-original/Tabs';
import type TabsType from '@theme/Tabs';
import type {WrapperProps} from '@docusaurus/types';
import {useBrowserConsent} from '@cryptos-pki/frame/use-consent';

import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';
import {tabsWithoutStorage} from '@site/src/lib/tabs-storage';

type Props = WrapperProps<typeof TabsType>;

// Tab groups remember their choice only after the visitor accepts the cookie
// choice (src/lib/tabs-storage.ts). Picking a tab doesn't ask; only the
// theme and full-width switches do.
export default function Tabs(props: Props): ReactNode {
  const {state} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  return <TabsOriginal {...tabsWithoutStorage(props, state === 'accepted')} />;
}
