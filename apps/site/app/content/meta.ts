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
// The page title and link-preview tags every route uses, so each page shares
// one shape: the title and description, Open Graph and the Twitter card,
// with absolute URLs, since link previews never resolve relative ones.
import { TAGLINE } from "@cryptos-pki/frame/content";
import type { MetaDescriptor } from "react-router";

export const SITE_NAME = "CryptOS";
export const SITE_URL = "https://www.cryptos-pki.com";

// The link-preview card from packages/brand, served at the site root.
export const OG_IMAGE = {
  path: "/img/brand/og-card.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `The CryptOS mark and wordmark with the tagline: ${TAGLINE}™.`,
};

// The home page leads with the product and its trademarked tagline; every
// other page leads with its own name.
export const pageTitle = (page?: string) =>
  page
    ? `${page} · ${SITE_NAME}`
    : `${SITE_NAME} — ${TAGLINE.charAt(0).toLowerCase()}${TAGLINE.slice(1)}™`;

export interface PageMetaInput {
  /** The page's own name; the home page leaves it out. */
  title?: string;
  description: string;
  /** The page's path on the live site, from the root. */
  path: string;
}

export const pageMeta = ({ title, description, path }: PageMetaInput): MetaDescriptor[] => {
  const fullTitle = pageTitle(title);
  const url = `${SITE_URL}${path}`;
  const image = `${SITE_URL}${OG_IMAGE.path}`;
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: String(OG_IMAGE.width) },
    { property: "og:image:height", content: String(OG_IMAGE.height) },
    { property: "og:image:type", content: OG_IMAGE.type },
    { property: "og:image:alt", content: OG_IMAGE.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE.alt },
  ];
};
