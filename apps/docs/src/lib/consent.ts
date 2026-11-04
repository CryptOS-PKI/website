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
import {createConsent, type Consent} from '@cryptos-pki/frame/consent';

// The docs' one consent store (packages/frame consent.ts), made on first use
// in the browser. While prerendering there's no browser storage and no
// store. localStorage can also throw when site data is blocked; the store
// then keeps everything in memory.
let store: Consent | null = null;

export function docsConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  if (!store) {
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      storage = null;
    }
    store = createConsent({storage, prefix: DOCS_CONSENT_PREFIX});
  }
  return store;
}

// The storage key prefix, shared with the head script in
// docusaurus.config.ts that applies a remembered width before first paint.
export const DOCS_CONSENT_PREFIX = 'cryptos-docs';
