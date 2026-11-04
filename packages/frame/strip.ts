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

// The strip both sites show above the header: the current release and the
// pre-1.0 warning. The site renders this markup in its own page and the docs
// pass it to Docusaurus's announcement bar, so the two are the same bytes
// and site-frame.css draws them the same way.

export interface FrameLinks {
  site: string;
  docs: string;
  status: string;
  download: string;
}

export interface StripLink {
  label: string;
  href: string;
}

export interface ReleaseStrip {
  badge: string;
  heading: string;
  body: string;
  links: StripLink[];
}

const trimSlash = (url: string) => url.replace(/\/+$/, "");

// Where each site lives. A preview build passes its own addresses so the two
// previews link to each other instead of the live sites.
export function frameLinks({ siteUrl, docsUrl }: { siteUrl: string; docsUrl: string }): FrameLinks {
  const site = trimSlash(siteUrl);
  const docs = trimSlash(docsUrl);
  return {
    site,
    docs,
    status: `${docs}/docs/introduction/status-roadmap`,
    download: `https://github.com/CryptOS-PKI/cryptos-appliance/releases/tag/${release.version}`,
  };
}

export function releaseStrip(links: FrameLinks): ReleaseStrip {
  return {
    badge: release.kind === "prerelease" ? "Pre-release" : "Release",
    heading: `${release.version} is out.`,
    body: "Until v1.0.0, any release may change fundamentally.",
    links: [
      { label: `Download ${release.version}`, href: links.download },
      { label: "Project status", href: links.status },
    ],
  };
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function stripHtml(links: FrameLinks): string {
  const strip = releaseStrip(links);
  const anchors = strip.links
    .map((link) => `<a class="strip__link" href="${escape(link.href)}">${escape(link.label)}</a>`)
    .join(" ");
  return (
    `<div class="strip__row">` +
    `<span class="strip__badge"><span class="strip__dot" aria-hidden="true"></span>${escape(strip.badge)}</span>` +
    `<p class="strip__text"><strong>${escape(strip.heading)}</strong> ${escape(strip.body)} ${anchors}</p>` +
    `</div>`
  );
}
