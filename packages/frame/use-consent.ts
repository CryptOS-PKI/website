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
import { useSyncExternalStore } from "react";

import { browserConsent, type Consent, type ConsentState } from "./consent.ts";

// Reads a consent store (consent.ts) from React and re-renders on every
// change. A prerendered page has no store (null), which reads as unanswered
// with nothing asked; a site whose markup depends on a stored preference
// waits until it has hydrated before reading it, so the first client render
// matches the prerendered one.
export function useConsent(consent: Consent | null): {
  state: ConsentState;
  asking: boolean;
  version: number;
} {
  const version = useSyncExternalStore(
    (listener) => (consent ? consent.subscribe(listener) : () => undefined),
    () => consent?.revision() ?? 0,
    () => 0,
  );
  return {
    state: consent?.state() ?? "unset",
    asking: consent?.asking() ?? false,
    version,
  };
}

const noSubscription = () => () => undefined;

// False while prerendering and during hydration, true after: a page reads
// stored preferences only once it's true, so its first render matches the
// prerendered markup.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

// The page's shared consent store for a prefix (consent.ts browserConsent),
// null until hydrated, with its state.
export function useBrowserConsent(prefix?: string) {
  const consent = useHydrated() ? browserConsent(prefix) : null;
  return { consent, ...useConsent(consent) };
}
