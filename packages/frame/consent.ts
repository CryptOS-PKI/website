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
// A light cookie consent for a site's own preferences (for example, the
// docs' full-width choice). There's no tracking behind it: it only decides
// whether a preference is remembered on this machine.
//
// - Before the visitor answers, nothing is written to storage. Preferences
//   live in memory for the page view, and setting one asks for an answer
//   (asking()), so a banner only shows to someone who changed something.
// - Accepting writes the answer and the preferences to storage, now and
//   from then on.
// - Declining removes anything stored and keeps preferences in memory only.
//   The refusal itself isn't stored either, so a later visit can ask again.
//
// Framework-free: a site wires it to its UI (use-consent.ts for React).

export type ConsentState = "unset" | "accepted" | "declined";

// The part of the Web Storage API the store uses; localStorage fits.
export type StorageLike = {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type Consent = {
  state(): ConsentState;
  asking(): boolean;
  accept(): void;
  decline(): void;
  get(name: string): string | null;
  set(name: string, value: string): void;
  subscribe(listener: () => void): () => void;
  // Bumped on every change, for a UI that needs a value to compare.
  revision(): number;
};

export const DEFAULT_CONSENT_PREFIX = "frame";

// Storage can be missing (prerendering) or throw (blocked cookies, some
// private windows); either way the store carries on in memory.
const safely = <T>(action: () => T, fallback: T): T => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

export function consentKeys(prefix: string = DEFAULT_CONSENT_PREFIX) {
  return {
    consent: `${prefix}:consent`,
    pref: (name: string) => `${prefix}:pref:${name}`,
  };
}

export function createConsent({
  storage,
  prefix = DEFAULT_CONSENT_PREFIX,
}: {
  storage: StorageLike | null;
  prefix?: string;
}): Consent {
  const keys = consentKeys(prefix);
  const read = (key: string) => (storage ? safely(() => storage.getItem(key), null) : null);
  const write = (key: string, value: string) =>
    storage && safely(() => storage.setItem(key, value), undefined);
  // Only touches storage when there's something there to clear.
  const remove = (key: string) => {
    if (storage && read(key) !== null) safely(() => storage.removeItem(key), undefined);
  };

  let state: ConsentState = read(keys.consent) === "accepted" ? "accepted" : "unset";
  let asking = false;
  const prefs = new Map<string, string>();
  const listeners = new Set<() => void>();
  let revision = 0;
  const changed = () => {
    revision++;
    listeners.forEach((listener) => listener());
  };

  return {
    state: () => state,
    asking: () => asking,
    accept() {
      state = "accepted";
      asking = false;
      write(keys.consent, "accepted");
      prefs.forEach((value, name) => write(keys.pref(name), value));
      changed();
    },
    decline() {
      if (state === "accepted") {
        // Bring stored preferences into memory so this page view keeps them.
        for (const name of storedNames()) {
          const value = read(keys.pref(name));
          if (value !== null && !prefs.has(name)) prefs.set(name, value);
        }
      }
      state = "declined";
      asking = false;
      remove(keys.consent);
      for (const name of new Set([...prefs.keys(), ...storedNames()])) remove(keys.pref(name));
      changed();
    },
    get(name) {
      if (prefs.has(name)) return prefs.get(name) ?? null;
      return state === "accepted" ? read(keys.pref(name)) : null;
    },
    set(name, value) {
      prefs.set(name, value);
      if (state === "accepted") write(keys.pref(name), value);
      else if (state === "unset") asking = true;
      changed();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    revision: () => revision,
  };

  // The preference names this store has written, found by key prefix, so a
  // decline can clear them without a list kept anywhere else.
  function storedNames(): string[] {
    if (!storage) return [];
    const prefPrefix = keys.pref("");
    return safely(() => {
      const names: string[] = [];
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (key?.startsWith(prefPrefix)) names.push(key.slice(prefPrefix.length));
      }
      return names;
    }, []);
  }
}

// One store per prefix for the page, made on first use in the browser, so
// every switch and the cookie bar share it. While prerendering there's no
// window and no store. Reading localStorage can throw when site data is
// blocked; the store then keeps everything in memory.
const browserStores = new Map<string, Consent>();

export function browserConsent(
  prefix: string = DEFAULT_CONSENT_PREFIX,
  win: { localStorage: StorageLike } | undefined = typeof window === "undefined"
    ? undefined
    : window,
): Consent | null {
  if (!win) return null;
  let store = browserStores.get(prefix);
  if (!store) {
    let storage: StorageLike | null;
    try {
      storage = win.localStorage;
    } catch {
      storage = null;
    }
    store = createConsent({ storage, prefix });
    browserStores.set(prefix, store);
  }
  return store;
}
