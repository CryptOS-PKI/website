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
import { HeaderMenu } from "@cryptos-pki/frame/header-menu";
import { NAV_LINK_CLASS } from "@cryptos-pki/frame/header-menu-config";

import { ThemeSwitch } from "./theme-switch";

import "./marketing.css";

interface NavLink {
  label: string;
  href: string;
}

interface NavProps {
  links: NavLink[];
}

const base = import.meta.env.BASE_URL;

// Base-layer component: the slim top nav. The docs header mirrors it from the
// same packages/frame tokens: the mark and wordmark, the links, then the
// theme switch at the right end. Under the frame's breakpoint the links fold
// into the shared menu button after the switch.
export const Nav = ({ links }: NavProps) => (
  <header className="nav">
    <div className="container nav__row">
      <a className="nav__brand" href={base} aria-label="CryptOS">
        <img
          className="nav__logo mark--light"
          src={`${base}img/brand/cryptos-mark-light.svg`}
          width={28}
          height={28}
          alt=""
        />
        <img
          className="nav__logo mark--dark"
          src={`${base}img/brand/cryptos-mark-dark.svg`}
          width={28}
          height={28}
          alt=""
        />
        <span className="nav__title">
          Crypt<span className="nav__title-accent">OS</span>
        </span>
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          {links.map((link) => (
            <li key={link.href} className={NAV_LINK_CLASS}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          <li className="nav__theme">
            <ThemeSwitch />
          </li>
          <HeaderMenu as="li" links={links} />
        </ul>
      </nav>
    </div>
  </header>
);
