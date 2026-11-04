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
import { legalHtml, markedHtml } from "@cryptos-pki/frame/content";

import "./marketing.css";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  tagline: string;
  groups: FooterGroup[];
  marks: string[];
}

const base = import.meta.env.BASE_URL;

// Base-layer component: the one footer every page uses -- the brand, the
// link groups, then the legal line with the trademark notices. The docs
// footer mirrors it from the same packages/frame tokens.
export const Footer = ({ tagline, groups, marks }: FooterProps) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="footer__name" href={base} aria-label="CryptOS">
              <img
                className="footer__mark mark--light"
                src={`${base}img/brand/cryptos-mark-light.svg`}
                width={24}
                height={24}
                alt=""
              />
              <img
                className="footer__mark mark--dark"
                src={`${base}img/brand/cryptos-mark-dark.svg`}
                width={24}
                height={24}
                alt=""
              />
              <span className="footer__wordmark">
                Crypt<span className="footer__wordmark-accent">OS</span>
              </span>
            </a>
            <p
              className="footer__tagline"
              dangerouslySetInnerHTML={{ __html: `${markedHtml(tagline)}.` }}
            />
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="footer__group">
              <h2 className="footer__heading">{group.title}</h2>
              <ul className="footer__links">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p
          className="footer__legal"
          dangerouslySetInnerHTML={{ __html: legalHtml(marks, new Date().getFullYear()) }}
        />
      </div>
    </footer>
  );
};
