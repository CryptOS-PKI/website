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
import { Wordmark } from "@cryptos-pki/ui";

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

// Renders a mark with its ™ bound to the last word in a no-break span,
// so a line break can never land between the word and its mark.
const MarkedTerm = ({ mark }: { mark: string }) => {
  const lastSpace = mark.lastIndexOf(" ");
  const rest = lastSpace === -1 ? "" : mark.slice(0, lastSpace + 1);
  const lastWord = lastSpace === -1 ? mark : mark.slice(lastSpace + 1);
  return (
    <>
      {rest}
      <span className="nowrap">
        {lastWord}
        <sup className="tm">™</sup>
      </span>
    </>
  );
};

const markSeparator = (index: number, count: number) => {
  if (index === 0) return "";
  return index === count - 1 ? " and " : ", ";
};

// Base-layer component: the one footer every page uses -- the brand, the
// link groups, then the legal line with the trademark notices.
export const Footer = ({ tagline, groups, marks }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="footer__name" href="/" aria-label="CryptOS">
              <Wordmark product="CryptOS" markSize={24} />
            </a>
            <p className="footer__tagline">{tagline}</p>
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
        <p className="footer__legal">
          {marks.map((mark, index) => (
            <span key={mark}>
              {markSeparator(index, marks.length)}
              <MarkedTerm mark={mark} />
            </span>
          ))}{" "}
          {marks.length > 1 ? "are trademarks" : "is a trademark"} of the CryptOS-PKI project.
          &copy; {year} The CryptOS Authors. Licensed under Apache-2.0.
        </p>
      </div>
    </footer>
  );
};
