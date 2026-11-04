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
import { Hero } from "@cryptos-pki/frame/hero";
import { FleetosMark } from "@cryptos-pki/ui";
import type { MetaFunction } from "react-router";

import { FeatureGrid } from "~/components/feature-grid";
import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { Strip } from "~/components/strip";
import {
  fleetosManager,
  footer,
  hero,
  links,
  meta as pageMeta,
  nav,
  standards,
  trustModel,
  whatItIs,
} from "~/content/cryptos";

export const meta: MetaFunction = () => [
  { title: pageMeta.title },
  { name: "description", content: pageMeta.description },
  { property: "og:site_name", content: pageMeta.siteName },
  { property: "og:title", content: pageMeta.title },
  { property: "og:description", content: pageMeta.description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: pageMeta.url },
  { name: "twitter:card", content: "summary" },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Strip links={links} />
      <Nav links={nav.links} />
      <main id="main">
        <Hero primaryCta={hero.primaryCta} secondaryCta={hero.secondaryCta} />

        <Section
          id="what-it-is"
          eyebrow={whatItIs.eyebrow}
          heading={whatItIs.heading}
          lede={whatItIs.lede}
        >
          <FeatureGrid items={whatItIs.features} />
        </Section>

        <Section
          id="trust-model"
          eyebrow={trustModel.eyebrow}
          heading={trustModel.heading}
          lede={trustModel.lede}
          tone="card"
          layout="split"
        >
          <p className="prose">
            {trustModel.body} <a href={trustModel.link.href}>{trustModel.link.label}</a>
          </p>
        </Section>

        <Section
          id="fleetos-manager"
          eyebrow={fleetosManager.eyebrow}
          heading={fleetosManager.heading}
          lede={fleetosManager.lede}
          layout="split"
        >
          <div className="fleetos-row">
            <FleetosMark size={48} />
            <p className="prose">
              {fleetosManager.body}{" "}
              <a href={fleetosManager.link.href}>{fleetosManager.link.label}</a>
            </p>
          </div>
        </Section>

        <Section
          id="standards"
          eyebrow={standards.eyebrow}
          heading={standards.heading}
          lede={standards.lede}
          tone="card"
          layout="split"
        >
          <p className="prose">
            {standards.body} <a href={standards.link.href}>{standards.link.label}</a>
          </p>
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
