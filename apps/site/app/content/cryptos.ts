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
// Content layer: the page's copy in one place; the components it feeds take
// it as props. The hero's copy is shared with the docs home
// (packages/frame/hero-content.ts). No emoji on the product site.
import { frameFooter, frameNav } from "@cryptos-pki/frame/content";
import { heroLedeText } from "@cryptos-pki/frame/hero-content";
import { frameLinks } from "@cryptos-pki/frame/strip";

// Where the two sites live. The site's own links stay on its base path; a
// preview build sets VITE_DOCS_URL so it links to the docs preview instead
// of the live docs. import.meta.env is Vite's; the content tests run in plain
// Node, where it's absent and the live addresses apply.
export const links = frameLinks({
  siteUrl: import.meta.env?.BASE_URL ?? "/",
  docsUrl: import.meta.env?.VITE_DOCS_URL ?? "https://docs.cryptos-pki.com",
});

// The home page's description: the hero's lede, the same words the docs home
// opens with. Titles and preview tags come from meta.ts.
export const homeMeta = {
  description: heroLedeText,
};

// The header links and the footer are shared with the docs (packages/frame).
export const nav = { links: frameNav(links) };

// The hero's copy is shared (packages/frame); the site picks its calls to
// action.
export const hero = {
  primaryCta: {
    label: "Read the docs",
    href: `${links.docs}/docs`,
  },
  secondaryCta: { label: "View on GitHub", href: "https://github.com/CryptOS-PKI" },
};

export const whatItIs = {
  eyebrow: "What it is",
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
  heading: "Tested source, unsigned images, your keys.",
  lede: "We publish and test the source. You decide who signs what runs.",
  body: "CryptOS ships unsigned images built from source you can read and test yourself. Secure Boot enrollment, image signing and the keys behind them stay with you: nothing in the chain of trust for your fleet is signed by us.",
};

export const fleetosManager = {
  eyebrow: "FleetOS Manager",
  heading: "One view across every linked node.",
  lede: "An optional web console for day-to-day operations -- the nodes keep working without it.",
  body: "Link a node to the FleetOS Manager for topology, certificate inventory and ceremony history across your fleet. The manager never holds issuance authority -- its own certificate can't sign.",
};

export const standards = {
  eyebrow: "Standards",
  heading: "Built to the PKI RFCs.",
  lede: "X.509, OCSP, time-stamps, ACME, EST and SCEP.",
  body: "Your time-stamp policy is yours: its OID sits under your own IANA Private Enterprise Number.",
  link: {
    label: "Get a TSA policy OID",
    href: `${links.docs}/docs/using/tsa-policy-oid`,
  },
};

export const footer = frameFooter(links);
