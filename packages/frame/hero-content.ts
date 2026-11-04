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
// The hero both sites open with: the same headline, lede and terminal on the
// product site's home and the docs home, so the two read as one product. Each
// site supplies only its own calls to action; the docs home adds one line
// saying who the docs are for.

export interface HeroLedeSegment {
  text: string;
  /** A key term, drawn in the ink colour on a primary tint. */
  accent?: boolean;
}

export interface HeroTerminalLine {
  /** A command the reader would type, drawn after a prompt. */
  prompt?: string;
  /** A line of output. */
  text?: string;
}

export const hero = {
  headline: "Your own certificate authority, on a PKI OS",
  headlineAccent: "with no shell to break into.",
  lede: [
    { text: "CryptOS turns a bare machine into an " },
    { text: "immutable", accent: true },
    { text: ", " },
    { text: "API-driven", accent: true },
    {
      text: " certificate authority: no shell, no login, no door in except the API. Every image is built from ",
    },
    { text: "tested source", accent: true },
    { text: " and signed only when you boot it, so you " },
    { text: "hold the keys", accent: true },
    { text: ", not us." },
  ] satisfies HeroLedeSegment[],
  // Illustrative output of two real cryptosctl commands (see the cryptosctl
  // reference in the docs): the node's CA certificate and its chain check.
  terminal: {
    title: "cryptosctl",
    lines: [
      { prompt: "cryptosctl identity show" },
      { text: "subject    CN=Example Issuing CA" },
      { text: "issuer     CN=Example Root CA" },
      { text: "chain      3 certificates" },
      { prompt: "cryptosctl identity validate" },
      { text: "OK: certificate chain validates" },
    ] satisfies HeroTerminalLine[],
  },
};

// The lede as plain text, for the page descriptions and link previews.
export const heroLedeText = hero.lede.map((segment) => segment.text).join("");

// The line the docs home adds after the lede.
export const docsHeroNote =
  "This is the documentation for CryptOS users and administrators: building it, running it, and managing a fleet with FleetOS Manager.";
