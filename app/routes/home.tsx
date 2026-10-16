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
import { Section } from "~/components/section";
import { SplitHero } from "~/components/split-hero";
import { TerminalCard } from "~/components/terminal-card";
import {
  fleetosManager,
  footer,
  hero,
  meta as pageMeta,
  nav,
  trustModel,
  whatItIs,
} from "~/content/cryptos";

export const meta: MetaFunction = () => [
  { title: pageMeta.title },
  { name: "description", content: pageMeta.description },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav links={nav.links} />
      <main id="main">
        <SplitHero
          eyebrow={hero.eyebrow}
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
        >
          <p className="prose">{trustModel.body}</p>
        </Section>

        <Section
          id="fleetos-manager"
          eyebrow={fleetosManager.eyebrow}
          heading={fleetosManager.heading}
          lede={fleetosManager.lede}
        >
          <div className="fleetos-row">
            <FleetosMark size={48} />
            <p className="prose">{fleetosManager.body}</p>
          </div>
        </Section>
      </main>
      <Footer marks={footer.marks} links={footer.links} />
    </>
  );
}
