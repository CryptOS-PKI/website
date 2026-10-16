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

interface NavLink {
  label: string;
  href: string;
}

interface NavProps {
  links: NavLink[];
}

// Base-layer component: a slim top nav, reusable across products. Only the
// Wordmark's `product` prop and the link list are product-specific.
export const Nav = ({ links }: NavProps) => (
  <header className="nav">
    <div className="container nav__row">
      <a className="nav__brand" href="/" aria-label="CryptOS">
        <Wordmark product="CryptOS" markSize={28} />
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
);
