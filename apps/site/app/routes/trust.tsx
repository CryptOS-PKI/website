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
import type { MetaFunction } from "react-router";

import { Diagram } from "~/components/diagrams";
import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { Strip } from "~/components/strip";
import { ControlExplorer, DocumentList, PostureTiles, SubProcessorTable } from "~/components/trust";
import { footer, links, meta as siteMeta, nav } from "~/content/cryptos";
import { areas, controls } from "~/content/trust/controls";
import { trustCenter } from "~/content/trust/trust-center";

export const meta: MetaFunction = () => [
  { title: trustCenter.meta.title },
  { name: "description", content: trustCenter.meta.description },
  { property: "og:site_name", content: siteMeta.siteName },
  { property: "og:title", content: trustCenter.meta.title },
  { property: "og:description", content: trustCenter.meta.description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: `${siteMeta.url}trust` },
  { name: "twitter:card", content: "summary" },
];

// The Trust Center: the posture, two figures, every control with its status
// and evidence, the documents, sub-processors and how to report a
// vulnerability. All of it comes from app/content/trust.
export default function Trust() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Strip links={links} />
      <Nav links={nav.links} />
      <main id="main">
        <Section
          id="posture"
          eyebrow="Trust Center"
          heading={trustCenter.posture.heading}
          lede={trustCenter.posture.lede}
        >
          <ul className="area-nav" aria-label="On this page">
            {trustCenter.sections.map((s) => (
              <li key={s.href}>
                <a href={s.href}>{s.label}</a>
              </li>
            ))}
          </ul>
          <PostureTiles controls={controls} />
          {trustCenter.posture.notes.map((n) => (
            <p key={n} className="prose trust-note">
              {n}
            </p>
          ))}
        </Section>

        <Section
          id="architecture"
          eyebrow="Architecture"
          heading={trustCenter.architecture.heading}
          lede={trustCenter.architecture.lede}
          tone="card"
        >
          {trustCenter.architecture.figures.map((f) => (
            <Diagram key={f.diagram} id={f.diagram} number={f.number} caption={f.caption} />
          ))}
        </Section>

        <Section
          id="controls"
          eyebrow="Controls"
          heading={trustCenter.controls.heading}
          lede={trustCenter.controls.lede}
        >
          <ControlExplorer areas={areas} controls={controls} copy={trustCenter.controls} />
        </Section>

        <Section
          id="documents"
          eyebrow="Documents"
          heading={trustCenter.documents.heading}
          lede={trustCenter.documents.lede}
          tone="card"
        >
          <DocumentList documents={trustCenter.documents.items} />
        </Section>

        <Section
          id="subprocessors"
          eyebrow="Sub-processors"
          heading={trustCenter.subprocessors.heading}
          lede={trustCenter.subprocessors.lede}
        >
          <SubProcessorTable rows={trustCenter.subprocessors.rows} />
        </Section>

        <Section
          id="report"
          eyebrow="Report a vulnerability"
          heading={trustCenter.report.heading}
          lede={trustCenter.report.lede}
          tone="card"
        >
          <ol className="prose trust-steps">
            {trustCenter.report.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="prose trust-doc-link">
            <a href={trustCenter.report.href}>{trustCenter.report.cta}</a>
          </p>
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
