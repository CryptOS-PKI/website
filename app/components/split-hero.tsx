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
import { Button } from "@cryptos-pki/ui";
import type { ReactNode } from "react";

import type { LedeSegment } from "~/content/cryptos";

import "./marketing.css";

interface Cta {
  label: string;
  href: string;
}

interface SplitHeroProps {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  lede: LedeSegment[];
  primaryCta: Cta;
  secondaryCta: Cta;
  children: ReactNode;
}

// Base-layer component: a two-column hero over a faint grid backdrop with a
// blurred radial glow, top-right. Same recipe as the Astro proof's
// SplitHero.astro, so the two builds render identically; the CTA buttons are
// the kit's own <Button asChild> so this version also exercises the design
// system's real component, not a lookalike.
export const SplitHero = ({
  eyebrow,
  headlineLine1,
  headlineLine2,
  lede,
  primaryCta,
  secondaryCta,
  children,
}: SplitHeroProps) => (
  <section className="hero">
    <div className="hero__backdrop" aria-hidden="true" />
    <div className="container hero__grid">
      <div className="hero__copy">
        <p className="hero__eyebrow">{eyebrow}</p>
        <h1 className="hero__headline">
          <span>{headlineLine1}</span>
          <span className="hero__headline-accent">{headlineLine2}</span>
        </h1>
        <p className="hero__lede">
          {lede.map((segment, index) =>
            segment.accent ? (
              <mark key={index}>{segment.text}</mark>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </p>
        <div className="hero__actions">
          <Button asChild size="lg">
            <a href={primaryCta.href}>{primaryCta.label}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={secondaryCta.href}>{secondaryCta.label}</a>
          </Button>
        </div>
      </div>
      <div className="hero__aside">{children}</div>
    </div>
  </section>
);
