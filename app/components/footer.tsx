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

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  marks: string[];
  links: FooterLink[];
}

// Base-layer component: the footer, including the trademark notices every
// product site needs. Mirrors the Astro proof's Footer.astro.
export const Footer = ({ marks, links }: FooterProps) => {
  const year = new Date().getFullYear();
  const marksLine = marks.map((mark) => `${mark}™`).join(" and ");

  return (
    <footer className="footer">
      <div className="container footer__row">
        <nav aria-label="Footer">
          <ul className="footer__links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer__legal">
          {marksLine} {marks.length > 1 ? "are trademarks" : "is a trademark"}. &copy; {year}. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};
