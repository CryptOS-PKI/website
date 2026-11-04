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
import { TAGLINE, markedHtml } from "./content.ts";
import { hero, type HeroLedeSegment } from "./hero-content.ts";

import "./hero.css";

// The hero both sites open with (hero-content.ts): the trademarked tagline as
// the eyebrow, the two-line headline with its accent line, the lede, the
// calls to action, and the terminal card on the right over a faint grid with
// a glow at the top right. Plain classes from hero.css, so the docs, which
// have no Tailwind, draw the same hero as the site. Each site passes its own
// calls to action, already resolved against its base path.

export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroProps {
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  /** A line under the calls to action; the docs home says who the docs are for. */
  note?: string;
}

const Lede = ({ segments }: { segments: HeroLedeSegment[] }) => (
  <p className="frame-hero__lede">
    {segments.map((segment, index) =>
      segment.accent ? (
        <mark key={index}>{segment.text}</mark>
      ) : (
        <span key={index}>{segment.text}</span>
      ),
    )}
  </p>
);

const Terminal = () => (
  <div
    className="frame-hero__terminal"
    role="img"
    aria-label={`Illustrative terminal output: ${hero.terminal.lines
      .flatMap((line) => (line.prompt ? [line.prompt] : []))
      .join(", ")}`}
  >
    <div className="frame-hero__terminal-bar">
      <span className="frame-hero__terminal-dot" />
      <span className="frame-hero__terminal-dot" />
      <span className="frame-hero__terminal-dot" />
      <span className="frame-hero__terminal-title">{hero.terminal.title}</span>
    </div>
    <pre className="frame-hero__terminal-body">
      {hero.terminal.lines.map((line, index) => (
        <span key={index} className="frame-hero__terminal-line">
          {line.prompt !== undefined ? (
            <>
              <span className="frame-hero__terminal-prompt">$</span> {line.prompt}
            </>
          ) : (
            <span className="frame-hero__terminal-output">{line.text}</span>
          )}
        </span>
      ))}
      <span className="frame-hero__terminal-cursor" aria-hidden="true" />
    </pre>
  </div>
);

export const Hero = ({ primaryCta, secondaryCta, note }: HeroProps) => (
  <section className="frame-hero">
    <div className="frame-hero__backdrop" aria-hidden="true" />
    <div className="frame-hero__inner">
      <div className="frame-hero__copy">
        <p
          className="frame-hero__eyebrow"
          dangerouslySetInnerHTML={{ __html: markedHtml(TAGLINE) }}
        />
        <h1 className="frame-hero__headline">
          <span>{hero.headline}</span>
          <span className="frame-hero__accent">{hero.headlineAccent}</span>
        </h1>
        <Lede segments={hero.lede} />
        <div className="frame-hero__actions">
          <a className="frame-hero__cta frame-hero__cta--primary" href={primaryCta.href}>
            {primaryCta.label}
          </a>
          <a className="frame-hero__cta frame-hero__cta--outline" href={secondaryCta.href}>
            {secondaryCta.label}
          </a>
        </div>
        {note ? <p className="frame-hero__note">{note}</p> : null}
      </div>
      <div className="frame-hero__aside">
        <Terminal />
      </div>
    </div>
  </section>
);
