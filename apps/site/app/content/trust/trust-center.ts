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
import type { DiagramId, SubProcessor, TrustDocument } from "./types.ts";

export const SECURITY_POLICY = "https://github.com/CryptOS-PKI/.github/blob/main/SECURITY.md";

export const trustCenter = {
  meta: {
    description:
      "How CryptOS protects the keys it holds: every control by area with its status and evidence, what is planned and what is deliberately left out, and how to report a vulnerability.",
  },
  sections: [
    { label: "Posture", href: "#posture" },
    { label: "Architecture", href: "#architecture" },
    { label: "Controls", href: "#controls" },
    { label: "Documents", href: "#documents" },
    { label: "Sub-processors", href: "#subprocessors" },
    { label: "Report", href: "#report" },
  ],
  posture: {
    heading: "What protects your CA, and what doesn't yet.",
    lede: "Every control below says whether it is built, the release it shipped in and the code and tests that prove it. Gaps link the open work that tracks them, and the things CryptOS leaves out on purpose say why.",
    notes: [
      "CryptOS holds no certifications. It is open-source software you run yourself, not a hosted service, so there is no SOC 2 report or ISO 27001 certificate to share. Every claim here links to the code, so your own reviewers can test it.",
      "CryptOS is pre-1.0 (v0.1.0-rc.1 is the latest release). Expect the gaps listed here to change from one release candidate to the next.",
    ],
  },
  architecture: {
    heading: "How it fits together.",
    lede: "The node's surfaces and where each trust boundary sits, then the appliance from firmware to the CA. The security review adds the boot chain, key custody and the fleet.",
    figures: [
      {
        diagram: "architecture",
        number: 1,
        caption:
          "Architecture and trust boundaries. Solid arrows are calls; dashed arrows are reads and writes on the box.",
      },
      {
        diagram: "appliance-hld",
        number: 2,
        caption:
          "The appliance, from firmware to the CA. Dashed arrows show what the firmware boots and what the TPM unseals on disk.",
      },
    ] satisfies { diagram: DiagramId; number: number; caption: string }[],
  },
  controls: {
    heading: "Controls by area.",
    lede: "Implemented means it is built and on main, with the release it first shipped in. Partial means it is built with a named gap. Planned means it isn't built yet. Not planned means it is left out on purpose.",
    filterLabel: "Show controls by status",
    sortLabel: "Sort",
    sortOptions: [
      { value: "area", label: "By area" },
      { value: "status", label: "By status" },
    ],
    clear: "Show all",
    shareNote: "The filter is kept in the address, so you can share this view.",
    empty: "No controls match this filter.",
  },
  documents: {
    heading: "Documents.",
    lede: "The security review is the long form of this page: architecture, the appliance, the boot chain and key custody, the fleet, and every control with its evidence.",
    items: [
      {
        title: "Security review",
        summary:
          "Architecture, appliance design, boot chain and TPM key custody, the fleet, and every control with its evidence, in four numbered figures.",
        href: "/trust/security-review",
        action: "Read the review",
      },
      {
        title: "Security policy",
        summary: "How to report a vulnerability and which versions get fixes.",
        href: SECURITY_POLICY,
      },
      {
        title: "Secure Boot with your own key",
        summary: "Why releases ship unsigned and how you sign the image you boot.",
        href: "https://github.com/CryptOS-PKI/cryptos-appliance/blob/main/docs/secure-boot.md",
      },
      {
        title: "Keys never leave the TPM",
        summary: "How the CA key is made, used and kept inside the TPM.",
        href: "https://github.com/CryptOS-PKI/website/blob/main/apps/docs/docs/deep-dives/keys-never-leave-tpm.md",
      },
    ] satisfies TrustDocument[],
  },
  subprocessors: {
    heading: "Sub-processors.",
    lede: "CryptOS is self-hosted. The project runs no service that sees your keys, certificates or audit trail. The only outside services are the project's own infrastructure and the ones you choose to connect.",
    rows: [
      {
        name: "GitHub",
        purpose: "Source code, CI, releases, container images and private vulnerability reports",
        data: "No customer data. You download images and releases from it.",
        scope: "Project infrastructure",
      },
      {
        name: "Cloudflare Pages",
        purpose: "Hosts this website and the docs",
        data: "Visitors' requests to these sites. No product data.",
        scope: "Project infrastructure",
      },
      {
        name: "Your storage for FleetOS Manager",
        purpose: "The manager's inventory, approvals and audit log",
        data: "Fleet metadata and certificates, never a CA private key",
        scope: "Chosen and run by you; none is bundled",
      },
      {
        name: "Your operator CA",
        purpose: "Signs the certificates FleetOS Manager operators sign in with",
        data: "Operator names and access levels",
        scope: "Chosen and run by you",
      },
    ] satisfies SubProcessor[],
  },
  report: {
    heading: "Found a vulnerability? Tell us privately.",
    lede: "Please don't open a public issue, discussion or pull request for a suspected vulnerability.",
    steps: [
      "Open the affected repository on GitHub, go to the Security tab and choose Report a vulnerability.",
      "Say what you found, how to reproduce it, and the version or commit affected.",
      "Expect an acknowledgement within a few business days. We'll agree a fix and a disclosure timeline with you, and credit you in the advisory unless you'd rather not be named.",
    ],
    cta: "Read the security policy",
    href: SECURITY_POLICY,
  },
};
