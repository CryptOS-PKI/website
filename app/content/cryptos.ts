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
// Content layer: same shape and same copy as the Astro proof's
// src/content/cryptos.ts, so the two builds are an apples-to-apples
// comparison. A new product gets its own file in this shape; the page and
// every component stay unchanged.
export interface LedeSegment {
  text: string;
  accent?: boolean;
}

export const meta = {
  title: "CryptOS -- an immutable, API-driven PKI operating system",
  description:
    "CryptOS is an immutable, API-driven, high-assurance PKI operating system. No SSH, no shell: every operation goes through an mTLS-authenticated API.",
};

export const nav = {
  links: [
    { label: "What it is", href: "#what-it-is" },
    { label: "Trust model", href: "#trust-model" },
    { label: "FleetOS Manager", href: "#fleetos-manager" },
    { label: "Standards", href: "#standards" },
    { label: "GitHub", href: "https://github.com/CryptOS-PKI" },
  ],
};

export const releaseStatus = {
  badge: "Pre-release",
  heading: "v0.1.0-rc.1 is out.",
  body: "A release candidate for testing, not for production. The unsigned images and the release notes are on GitHub.",
  cta: {
    label: "Download v0.1.0-rc.1",
    href: "https://github.com/CryptOS-PKI/cryptos-appliance/releases/tag/v0.1.0-rc.1",
  },
};

export const hero = {
  eyebrow: "CryptOS-PKI",
  // Decorative only (rendered aria-hidden next to the headline); written as a
  // Unicode escape rather than the literal character, consistent with the
  // no-emoji-in-source-files rule everywhere else in this repo.
  headlineIcon: "\u{1F512}", // lock
  headlineLine1: "A PKI operating system",
  headlineLine2: "with no shell to break into.",
  lede: [
    { text: "Every CryptOS image is built from " },
    { text: "tested source", accent: true },
    { text: ", shipped " },
    { text: "unsigned", accent: true },
    { text: ", and signed only when you boot it, so you " },
    { text: "hold the keys", accent: true },
    { text: ", not us." },
  ] satisfies LedeSegment[],
  primaryCta: {
    label: "Read the docs",
    href: "https://github.com/CryptOS-PKI/docs/tree/v0.1.0-rc.1/docs",
  },
  secondaryCta: { label: "View on GitHub", href: "https://github.com/CryptOS-PKI" },
  terminal: {
    title: "cryptosctl identity show",
    lines: [
      "$ cryptosctl identity show",
      "role       issuing-ca",
      "status     active -- TPM-sealed",
      "chain      valid -- 2 intermediates",
      "api        mTLS gRPC -- no shell, no SSH",
    ],
  },
};

export const whatItIs = {
  eyebrow: "What it is",
  icon: "\u{2693}", // anchor -- matches "trust anchor" in the heading
  heading: "An operating system built around one job: being a trust anchor.",
  lede: "No login prompt, no package manager, no general-purpose shell -- just the PKI API.",
  features: [
    {
      title: "Immutable rootfs",
      body: "A read-only SquashFS image. State lives only in an encrypted partition unsealed by the local TPM.",
    },
    {
      title: "TPM-bound keys",
      body: "Private keys are wrapped by the TPM and never touch disk in the clear.",
    },
    {
      title: "Declarative config",
      body: "Roles, hierarchy and issuance policy are version-controlled YAML applied over the API.",
    },
    {
      title: "No interactive access",
      body: "No SSH, no shell, no usernames or passwords. Every change goes through mTLS gRPC.",
    },
  ],
};

export const trustModel = {
  eyebrow: "Trust model",
  icon: "\u{1F511}", // key -- matches "your keys" in the heading
  heading: "Tested source, unsigned images, your keys.",
  lede: "We publish and test the source. You decide who signs what runs.",
  body: "CryptOS ships unsigned images built from source you can read and test yourself. Secure Boot enrollment, image signing and the keys behind them stay with you: nothing in the chain of trust for your fleet is signed by us.",
};

export const fleetosManager = {
  eyebrow: "FleetOS Manager",
  icon: "\u{1F6F0}\u{FE0F}", // satellite -- fleet of linked nodes
  heading: "One view across every linked node.",
  lede: "An optional web console for day-to-day operations -- the nodes keep working without it.",
  body: "Link a node to the FleetOS Manager for topology, certificate inventory and ceremony history across your fleet. The manager never holds issuance authority -- its own certificate can't sign.",
};

export const standards = {
  eyebrow: "Standards",
  icon: "\u{1F4DC}", // scroll -- the RFCs the heading names
  heading: "Built to the PKI RFCs.",
  lede: "X.509, OCSP, time-stamps, ACME, EST and SCEP.",
  body: "Your time-stamp policy is yours: its OID sits under your own IANA Private Enterprise Number.",
  link: {
    label: "Get a TSA policy OID",
    href: "https://github.com/CryptOS-PKI/docs/blob/v0.1.0-rc.1/docs/using/tsa-policy-oid.md",
  },
};

export const footer = {
  marks: ["CryptOS-PKI", "FleetOS"],
  links: [
    { label: "GitHub", href: "https://github.com/CryptOS-PKI" },
    { label: "Docs", href: "https://github.com/CryptOS-PKI/docs/tree/v0.1.0-rc.1/docs" },
  ],
};
