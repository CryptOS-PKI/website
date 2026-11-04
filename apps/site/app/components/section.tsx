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
import type { ReactNode } from "react";

import { splitTrailingWord } from "~/lib/text";

import "./marketing.css";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  icon?: string;
  heading: string;
  lede?: string;
  tone?: "default" | "card";
  // "stack": head above body, full container width (what-it-is's feature
  // grid already fills that width on its own). "split": head and body sit
  // side by side in the hero's own column ratio, for a section whose body
  // is a single block of prose that would otherwise sit in a narrow column
  // on the left with the rest of the wide container empty.
  layout?: "stack" | "split";
  children: ReactNode;
}

// Base-layer component: a content section with an optional eyebrow/heading,
// consistent width and vertical rhythm. Mirrors the Astro proof's
// Section.astro. `icon` is a single decorative character (an emoji escape
// from the content file, never a literal emoji in this source) shown after
// the heading's last word, wrapped aria-hidden so screen readers only read
// the heading itself, and kept in a `white-space: nowrap` unit with that
// word so the two can never land on separate lines.
export const Section = ({
  id,
  eyebrow,
  icon,
  heading,
  lede,
  tone = "default",
  layout = "stack",
  children,
}: SectionProps) => {
  const [headingLead, headingTail] = splitTrailingWord(heading);

  return (
    <section id={id} className={tone === "card" ? "section section--card" : "section"}>
      <div className={layout === "split" ? "container section__grid" : "container"}>
        <div className="section__head">
          {eyebrow ? <p className="section__eyebrow">{eyebrow}</p> : null}
          <h2 className="section__heading">
            {headingLead}
            <span className="section__heading-icon">
              {headingTail}
              {icon ? <span aria-hidden="true"> {icon}</span> : null}
            </span>
          </h2>
          {lede ? <p className="section__lede">{lede}</p> : null}
        </div>
        <div className="section__body">{children}</div>
      </div>
    </section>
  );
};
