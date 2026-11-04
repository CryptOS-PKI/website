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

import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { Strip } from "~/components/strip";
import { footer, links, nav } from "~/content/cryptos";
import { pageMeta } from "~/content/meta";
import { fleetDocs, fleetos, type FleetItem } from "~/content/fleetos";

import "~/components/trust.css";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "FleetOS Manager",
    description: fleetos.meta.description,
    path: "/fleetos-manager",
  });

const NextBadge = () => <span className="status status--planned">{fleetos.nextLabel}</span>;

const Cards = ({ items }: { items: FleetItem[] }) => (
  <ul className="feature-grid">
    {items.map((item) => (
      <li key={item.title} className="feature-card">
        <h3 className="feature-card__title fleet-card__title">
          {item.title} {item.next ? <NextBadge /> : null}
        </h3>
        <p className="feature-card__body">{item.body}</p>
      </li>
    ))}
  </ul>
);

// The FleetOS Manager page: what it is and how it operates. The copy lives in
// app/content/fleetos.ts, checked against cryptos-manager and cryptos-web.
export default function FleetosManager() {
  const { intro, whatItIs, joining, approvals, issuing, console: ui, storage, run } = fleetos;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Strip links={links} />
      <Nav links={nav.links} />
      <main id="main" className="frame-prose">
        <Section eyebrow={intro.eyebrow} heading={intro.heading} lede={intro.lede}>
          <div className="fleetos-row">
            <FleetosMark size={48} />
            <ul className="area-nav" aria-label="On this page">
              {fleetos.sections.map((s) => (
                <li key={s.href}>
                  <a href={s.href}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <p className="prose fleet-note">{fleetos.nextNote}</p>
        </Section>

        <Section
          id="what-it-is"
          eyebrow="What it is"
          heading={whatItIs.heading}
          lede={whatItIs.lede}
          tone="card"
        >
          <Cards items={whatItIs.items} />
        </Section>

        <Section
          id="joining"
          eyebrow="How a node joins"
          heading={joining.heading}
          lede={joining.lede}
        >
          <div className="fleet-flows">
            {joining.flows.map((flow) => (
              <figure key={flow.title} className="sr-flow fleet-flow">
                <figcaption>{flow.title}</figcaption>
                <ol>
                  {flow.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </figure>
            ))}
          </div>
          <p className="prose">{joining.after}</p>
        </Section>

        <Section
          id="approvals"
          eyebrow="Approvals"
          heading={approvals.heading}
          lede={approvals.lede}
          tone="card"
        >
          <Cards items={approvals.items} />
        </Section>

        <Section
          id="issuing"
          eyebrow="Issuing and revoking"
          heading={issuing.heading}
          lede={issuing.lede}
        >
          <Cards items={issuing.items} />
        </Section>

        <Section
          id="console"
          eyebrow="Console and CLI"
          heading={ui.heading}
          lede={ui.lede}
          tone="card"
        >
          <div className="fleet-split">
            <div>
              <h3 className="downloads__heading">The web console</h3>
              <ul className="fleet-pages">
                {ui.pages.map((page) => (
                  <li key={page}>{page}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="downloads__heading">
                {ui.cli.title} {ui.cli.next ? <NextBadge /> : null}
              </h3>
              <p className="prose">{ui.cli.body}</p>
              <pre className="fleet-cli">{ui.cli.commands.map((c) => `$ ${c}`).join("\n")}</pre>
            </div>
          </div>
        </Section>

        <Section id="storage" eyebrow="Storage" heading={storage.heading} lede={storage.lede}>
          <div className="table-scroll">
            <table className="downloads-table">
              <thead>
                <tr>
                  <th scope="col">Mode</th>
                  <th scope="col">Setting</th>
                  <th scope="col">Use it for</th>
                  <th scope="col">Persists</th>
                </tr>
              </thead>
              <tbody>
                {storage.modes.map((m) => (
                  <tr key={m.mode}>
                    <td>
                      {m.mode} {m.next ? <NextBadge /> : null}
                    </td>
                    <td>
                      <code>{m.setting}</code>
                    </td>
                    <td>{m.use}</td>
                    <td>{m.persists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="run"
          eyebrow="Ways to run it"
          heading={run.heading}
          lede={run.lede}
          tone="card"
        >
          <Cards items={run.items} />
          <p className="prose trust-doc-link fleet-cta">
            {run.docsLead}{" "}
            {fleetDocs(links.docs).map((link, index) => (
              <span key={link.href}>
                {index > 0 ? " · " : null}
                <a href={link.href}>{link.label}</a>
              </span>
            ))}
          </p>
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
