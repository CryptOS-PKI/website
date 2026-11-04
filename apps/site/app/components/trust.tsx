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
import { useEffect, useState } from "react";

import {
  DEFAULT_VIEW,
  STATUSES,
  countByStatus,
  formatHash,
  parseHash,
  type SortKey,
  toggleStatus,
  type View,
  visibleControls,
} from "~/content/trust/filter";
import {
  evidenceHref,
  issueHref,
  issueLabel,
  STATUS_NAMES,
  statusLabel,
} from "~/content/trust/links";
import type { Area, Control, SubProcessor, TrustDocument } from "~/content/trust/types";

import "./marketing.css";
import "./trust.css";

export const StatusBadge = ({ control }: { control: Pick<Control, "status" | "since"> }) => (
  <span className={`status status--${control.status}`}>{statusLabel(control)}</span>
);

export const ControlCard = ({ control }: { control: Control }) => (
  <li className="control-card" id={control.id}>
    <div className="control-card__head">
      <h4 className="control-card__title">
        <span className="control-card__id">{control.id}</span> {control.title}
      </h4>
      <StatusBadge control={control} />
    </div>
    <p className="control-card__body">{control.statement}</p>
    {control.reason ? <p className="control-card__reason">Why: {control.reason}</p> : null}
    {control.evidence.length ? (
      <details className="control-card__evidence">
        <summary>Evidence ({control.evidence.length})</summary>
        <ul>
          {control.evidence.map((e) => (
            <li key={`${e.repo}/${e.path}/${e.detail ?? ""}`}>
              <span className="evidence-kind">{e.kind}</span>{" "}
              <a href={evidenceHref(e)}>
                {e.repo}/{e.path}
              </a>
              {e.detail ? <> &middot; {e.detail}</> : null}
            </li>
          ))}
        </ul>
      </details>
    ) : null}
    {control.gaps?.length ? (
      <p className="control-card__gaps">
        Open work:{" "}
        {control.gaps.map((g, i) => (
          <span key={issueLabel(g)}>
            {i > 0 ? "; " : ""}
            <a href={issueHref(g)}>{issueLabel(g)}</a> {g.title}
          </span>
        ))}
      </p>
    ) : null}
  </li>
);

const ControlGroup = ({
  id,
  title,
  summary,
  items,
}: {
  id: string;
  title: string;
  summary?: string;
  items: Control[];
}) => (
  <div className="area" id={id}>
    <h3 className="area__title">
      {title} <span className="area__count">{items.length}</span>
    </h3>
    {summary ? <p className="area__summary">{summary}</p> : null}
    <ul className="control-list">
      {items.map((c) => (
        <ControlCard key={c.id} control={c} />
      ))}
    </ul>
  </div>
);

export const PostureTiles = ({ controls }: { controls: Control[] }) => {
  const counts = countByStatus(controls);
  return (
    <ul className="posture-tiles">
      {STATUSES.map((s) => (
        <li key={s} className={`posture-tile posture-tile--${s}`}>
          <span className="posture-tile__value">{counts[s]}</span>
          <span className="posture-tile__label">{STATUS_NAMES[s]}</span>
        </li>
      ))}
    </ul>
  );
};

interface ExplorerCopy {
  filterLabel: string;
  sortLabel: string;
  sortOptions: { value: string; label: string }[];
  clear: string;
  shareNote: string;
  empty: string;
}

// The controls list with its status chips and sort. The prerendered page is
// the default view (every control, by area), so it reads in full without
// JavaScript; the toolbar appears once the page is interactive. The view
// lives in the URL hash, so a filtered list can be shared as a link.
export const ControlExplorer = ({
  areas,
  controls,
  copy,
}: {
  areas: Area[];
  controls: Control[];
  copy: ExplorerCopy;
}) => {
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setView(parseHash(window.location.hash));
    read();
    setReady(true);
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const update = (next: View) => {
    setView(next);
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}${formatHash(next)}`);
  };

  const counts = countByStatus(controls);
  const shown = visibleControls(controls, view);

  return (
    <div className="explorer">
      {ready ? (
        <div className="explorer__bar">
          <div className="explorer__chips" role="group" aria-label={copy.filterLabel}>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip chip--${s}`}
                aria-pressed={view.statuses.includes(s)}
                onClick={() => update(toggleStatus(view, s))}
              >
                {STATUS_NAMES[s]} <span className="chip__count">{counts[s]}</span>
              </button>
            ))}
            {view.statuses.length ? (
              <button
                type="button"
                className="chip chip--clear"
                onClick={() => update({ ...view, statuses: [] })}
              >
                {copy.clear}
              </button>
            ) : null}
          </div>
          <label className="explorer__sort">
            {copy.sortLabel}{" "}
            <select
              value={view.sort}
              onChange={(e) => update({ ...view, sort: e.target.value as SortKey })}
            >
              {copy.sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="explorer__note" aria-live="polite">
            Showing {shown.length} of {controls.length} controls. {copy.shareNote}
          </p>
        </div>
      ) : null}

      {shown.length === 0 ? <p className="prose">{copy.empty}</p> : null}

      {view.sort === "area"
        ? areas.map((a) => {
            const items = shown.filter((c) => c.area === a.id);
            return items.length ? (
              <ControlGroup
                key={a.id}
                id={`area-${a.id}`}
                title={a.title}
                summary={a.summary}
                items={items}
              />
            ) : null;
          })
        : STATUSES.map((s) => {
            const items = shown.filter((c) => c.status === s);
            return items.length ? (
              <ControlGroup key={s} id={`status-${s}`} title={STATUS_NAMES[s]} items={items} />
            ) : null;
          })}
    </div>
  );
};

// Site-relative links follow the base path, as the rest of the site's do.
const siteBase = import.meta.env.BASE_URL.replace(/\/$/, "");
const siteHref = (href: string) => (href.startsWith("/") ? `${siteBase}${href}` : href);

export const DocumentList = ({ documents }: { documents: TrustDocument[] }) => (
  <ul className="feature-grid">
    {documents.map((d) => (
      <li key={d.title} className="feature-card">
        <h3 className="feature-card__title">{d.title}</h3>
        <p className="feature-card__body">{d.summary}</p>
        <p className="feature-card__body trust-doc-link">
          <a href={siteHref(d.href)}>{d.action ?? "Read it"}</a>
        </p>
      </li>
    ))}
  </ul>
);

export const SubProcessorTable = ({ rows }: { rows: SubProcessor[] }) => (
  <div className="table-scroll">
    <table className="downloads-table">
      <thead>
        <tr>
          <th scope="col">Service</th>
          <th scope="col">Purpose</th>
          <th scope="col">Data it sees</th>
          <th scope="col">Scope</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td>{r.name}</td>
            <td>{r.purpose}</td>
            <td>{r.data}</td>
            <td>{r.scope}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
