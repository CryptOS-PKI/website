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
import { StatusBadge } from "~/components/trust";
import { footer, links, meta as siteMeta, nav } from "~/content/cryptos";
import { areas, controls } from "~/content/trust/controls";
import { evidenceHref, issueHref, issueLabel } from "~/content/trust/links";
import { review } from "~/content/trust/review";
import type { Block, Control } from "~/content/trust/types";

import "~/components/trust.css";

const title = `${review.title} -- ${siteMeta.siteName}`;

export const meta: MetaFunction = () => [
  { title },
  { name: "description", content: review.subtitle },
  { property: "og:site_name", content: siteMeta.siteName },
  { property: "og:title", content: title },
  { property: "og:description", content: review.subtitle },
  { property: "og:type", content: "article" },
  { property: "og:url", content: `${siteMeta.url}trust/security-review` },
  { name: "twitter:card", content: "summary" },
];

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul className="sr-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="table-scroll">
          <table className="downloads-table">
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "flow":
      return (
        <figure className="sr-flow">
          <figcaption>{block.title}</figcaption>
          <ol>
            {block.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </figure>
      );
    case "note":
      return <p className={`sr-note sr-note--${block.tone}`}>{block.text}</p>;
    case "figure":
      return <Diagram id={block.diagram} number={block.number} caption={block.caption} />;
  }
}

function ControlRows({ items }: { items: Control[] }) {
  return (
    <div className="table-scroll">
      <table className="downloads-table">
        <thead>
          <tr>
            <th scope="col">Control</th>
            <th scope="col">Status</th>
            <th scope="col">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>
                <strong>
                  {c.id} {c.title}
                </strong>
                <br />
                {c.statement}
                {c.reason ? (
                  <>
                    <br />
                    <em>Why: {c.reason}</em>
                  </>
                ) : null}
              </td>
              <td>
                <StatusBadge control={c} />
              </td>
              <td className="sr-evidence">
                {c.evidence.map((e) => (
                  <span key={`${e.repo}/${e.path}/${e.detail ?? ""}`}>
                    <a href={evidenceHref(e)}>
                      {e.repo}/{e.path}
                    </a>
                    {e.detail ? ` (${e.detail})` : ""}
                  </span>
                ))}
                {c.gaps?.map((g) => (
                  <span key={issueLabel(g)}>
                    Open: <a href={issueHref(g)}>{issueLabel(g)}</a> {g.title}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The security review: the Trust Center's long form, with the four numbered
// figures and every control's evidence. A normal page of the site, so it
// carries the frame and works in both themes.
export default function SecurityReview() {
  const gaps = controls.filter((c) => c.status === "partial" || c.status === "planned");
  const nonGoals = controls.filter((c) => c.status === "not-planned");
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Strip links={links} />
      <Nav links={nav.links} />
      <main id="main" className="sr">
        <Section eyebrow="Trust Center" heading={review.title} lede={review.subtitle}>
          <dl className="sr-meta">
            <dt>Document</dt>
            <dd>{review.docVersion}</dd>
            <dt>Date</dt>
            <dd>{review.date}</dd>
            <dt>Product version</dt>
            <dd>{review.productVersion}</dd>
            <dt>Classification</dt>
            <dd>{review.classification}</dd>
          </dl>
          <p className="sr-note sr-note--warn prose">{review.disclaimer}</p>
          <nav className="sr-toc" aria-label="Contents">
            <ol className="prose">
              {review.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title.replace(/^\d+\.\s*/, "")}</a>
                </li>
              ))}
              <li>
                <a href="#gaps">Gaps and planned work</a>
              </li>
              <li>
                <a href="#non-goals">Left out on purpose</a>
              </li>
            </ol>
          </nav>
        </Section>

        {review.sections.map((s, index) => (
          <section
            key={s.id}
            id={s.id}
            className={index % 2 === 0 ? "section section--card" : "section"}
          >
            <div className="container sr-section">
              <h2>{s.title}</h2>
              {s.blocks.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
              {s.areas?.map((areaId) => {
                const area = areas.find((a) => a.id === areaId);
                const items = controls.filter((c) => c.area === areaId);
                return area && items.length ? (
                  <div key={areaId}>
                    <h3>Controls: {area.title}</h3>
                    <ControlRows items={items} />
                  </div>
                ) : null;
              })}
            </div>
          </section>
        ))}

        <section id="gaps" className="section">
          <div className="container sr-section">
            <h2>Gaps and planned work</h2>
            <p>{review.gapsIntro}</p>
            <ControlRows items={gaps} />
          </div>
        </section>

        <section id="non-goals" className="section section--card">
          <div className="container sr-section">
            <h2>Left out on purpose</h2>
            <p>{review.nonGoalsIntro}</p>
            <ControlRows items={nonGoals} />
          </div>
        </section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
