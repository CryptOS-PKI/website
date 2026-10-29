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
import { FleetosMark } from "@cryptos-pki/ui";
import type { MetaFunction } from "react-router";

import { FeatureGrid } from "~/components/feature-grid";
import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { ReleaseBanner } from "~/components/release-banner";
import { Section } from "~/components/section";
import { SplitHero } from "~/components/split-hero";
import { TerminalCard } from "~/components/terminal-card";
import {
  fleetosManager,
  footer,
  hero,
  meta as pageMeta,
  nav,
  releaseStatus,
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
  { property: "og:image", content: "https://www.cryptos-pki.com/og-image.png" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: "CryptOS — an immutable, API-driven PKI operating system" },
  { name: "twitter:card", content: "summary_large_image" },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav links={nav.links} />
      <ReleaseBanner
        badge={releaseStatus.badge}
        heading={releaseStatus.heading}
        body={releaseStatus.body}
        cta={releaseStatus.cta}
      />
      <main id="main">
        <SplitHero
          eyebrow={hero.eyebrow}
          headlineIcon={hero.headlineIcon}
          headlineLine1={hero.headlineLine1}
          headlineLine2={hero.headlineLine2}
          lede={hero.lede}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
        >
          <TerminalCard title={hero.terminal.title} lines={hero.terminal.lines} />
        </SplitHero>

        <Section
          id="what-it-is"
          eyebrow={whatItIs.eyebrow}
          icon={whatItIs.icon}
          heading={whatItIs.heading}
          lede={whatItIs.lede}
        >
          <FeatureGrid items={whatItIs.features} />
        </Section>

        <Section
          id="trust-model"
          eyebrow={trustModel.eyebrow}
          icon={trustModel.icon}
          heading={trustModel.heading}
          lede={trustModel.lede}
          tone="card"
          layout="split"
        >
          <p className="prose">{trustModel.body}</p>
        </Section>

        <Section
          id="fleetos-manager"
          eyebrow={fleetosManager.eyebrow}
          icon={fleetosManager.icon}
          heading={fleetosManager.heading}
          lede={fleetosManager.lede}
          layout="split"
        >
          <div className="fleetos-row">
            <FleetosMark size={48} />
            <p className="prose">{fleetosManager.body}</p>
          </div>
        </Section>

        <Section
          id="standards"
          eyebrow={standards.eyebrow}
          icon={standards.icon}
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
      <Footer marks={footer.marks} links={footer.links} />
    </>
  );
}
