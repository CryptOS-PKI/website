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
import { release } from "./release.ts";
import type { FrameLinks } from "./strip.ts";

// The header links and the footer both sites show, in one place, so the docs
// header and footer can't drift from the site's. The site passes its own base
// path as siteUrl (its links stay on the page it serves); the docs pass the
// site's address.

export interface FrameLink {
  label: string;
  href: string;
}

export interface FrameFooterGroup {
  title: string;
  links: FrameLink[];
}

export interface FrameFooter {
  tagline: string;
  groups: FrameFooterGroup[];
  marks: string[];
}

const github = "https://github.com/CryptOS-PKI";
const securityPolicy = "https://github.com/CryptOS-PKI/.github/blob/main/SECURITY.md";

export const frameNav = (links: FrameLinks): FrameLink[] => [
  { label: "What it is", href: `${links.site}/#what-it-is` },
  { label: "Trust model", href: `${links.site}/#trust-model` },
  { label: "FleetOS Manager", href: `${links.site}/#fleetos-manager` },
  { label: "Standards", href: `${links.site}/#standards` },
  { label: "Docs", href: `${links.docs}/` },
  { label: "GitHub", href: github },
];

export const frameFooter = (links: FrameLinks): FrameFooter => ({
  marks: ["CryptOS-PKI", "FleetOS", "No shell to break into"],
  tagline: "An immutable, API-driven PKI operating system.",
  groups: [
    {
      title: "Product",
      links: [
        { label: "What it is", href: `${links.site}/#what-it-is` },
        { label: "Trust model", href: `${links.site}/#trust-model` },
        { label: "FleetOS Manager", href: `${links.site}/#fleetos-manager` },
        { label: "Standards", href: `${links.site}/#standards` },
        { label: `Download ${release.version}`, href: links.download },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: `${links.docs}/` },
        { label: "GitHub", href: github },
        { label: "Releases", href: "https://github.com/CryptOS-PKI/cryptos-appliance/releases" },
      ],
    },
    {
      title: "Trust",
      links: [
        { label: "Trust model", href: `${links.site}/#trust-model` },
        { label: "Security policy", href: securityPolicy },
        { label: "Report a vulnerability", href: `${securityPolicy}#reporting-a-vulnerability` },
      ],
    },
  ],
});

const markSeparator = (index: number, count: number) => {
  if (index === 0) return "";
  return index === count - 1 ? " and " : ", ";
};

const legalTail = (count: number, year: number) =>
  ` ${count > 1 ? "are trademarks" : "is a trademark"} of the CryptOS-PKI project. ` +
  `© ${year} The CryptOS Authors. Licensed under Apache-2.0.`;

// The legal line as plain text, for checks and metadata.
export const legalLine = (marks: string[], year: number) =>
  marks.map((mark, index) => `${markSeparator(index, marks.length)}${mark}™`).join("") +
  legalTail(marks.length, year);

// The legal line as the site's footer renders it: each mark's last word and
// its trademark sign held together in a no-break span, so a line never breaks
// between them. The docs footer uses this markup as its copyright.
export const legalHtml = (marks: string[], year: number) =>
  marks
    .map((mark, index) => {
      const lastSpace = mark.lastIndexOf(" ");
      const rest = lastSpace === -1 ? "" : mark.slice(0, lastSpace + 1);
      const lastWord = lastSpace === -1 ? mark : mark.slice(lastSpace + 1);
      return (
        `<span>${markSeparator(index, marks.length)}${rest}` +
        `<span class="nowrap">${lastWord}<sup class="tm">™</sup></span></span>`
      );
    })
    .join("") + legalTail(marks.length, year);
