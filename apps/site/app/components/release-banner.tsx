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
import "./marketing.css";

interface ReleaseBannerCta {
  label: string;
  href: string;
}

interface ReleaseBannerProps {
  badge: string;
  heading: string;
  body: string;
  cta?: ReleaseBannerCta;
}

// Base-layer component: a pre-release status strip shown above the hero.
// Text stays in the foreground/muted-foreground pair against the card
// background (both exceed WCAG AA contrast in light and dark) -- the
// warning token is used only as a left accent border and the badge icon,
// never as a text/background text pair, because `--warning-foreground` on
// `--warning` falls short of AA for normal text in the light theme.
export const ReleaseBanner = ({ badge, heading, body, cta }: ReleaseBannerProps) => (
  <div className="release-banner" role="note" aria-label="Release status">
    <div className="container release-banner__row">
      <span className="release-banner__badge">
        <span className="release-banner__dot" aria-hidden="true" />
        {badge}
      </span>
      <p className="release-banner__text">
        <strong>{heading}</strong> {body}{" "}
        {cta ? (
          <a className="release-banner__link" href={cta.href}>
            {cta.label}
          </a>
        ) : null}
      </p>
    </div>
  </div>
);
