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

import "./marketing.css";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  heading: string;
  lede?: string;
  tone?: "default" | "card";
  children: ReactNode;
}

// Base-layer component: a content section with an optional eyebrow/heading,
// consistent width and vertical rhythm. Mirrors the Astro proof's
// Section.astro.
export const Section = ({
  id,
  eyebrow,
  heading,
  lede,
  tone = "default",
  children,
}: SectionProps) => (
  <section id={id} className={tone === "card" ? "section section--card" : "section"}>
    <div className="container">
      <div className="section__head">
        {eyebrow ? <p className="section__eyebrow">{eyebrow}</p> : null}
        <h2 className="section__heading">{heading}</h2>
        {lede ? <p className="section__lede">{lede}</p> : null}
      </div>
      <div className="section__body">{children}</div>
    </div>
  </section>
);
