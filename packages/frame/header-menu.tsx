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
import { useEffect, useId, useRef, useState } from "react";

import type { FrameLink } from "./content.ts";
import { type MenuEvent, nextMenuState } from "./header-menu-config.ts";

// The menu button both headers show under the breakpoint (site-frame.css),
// at the right end after the theme switch, and the panel of header links it
// opens under the header. Plain classes, so the docs, which have no
// Tailwind, render the same markup. The icons are the kit's IconMenu and
// IconClose, path for path.

const iconProps = {
  "aria-hidden": true,
  fill: "none",
  height: 16,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.75,
  viewBox: "0 0 24 24",
  width: 16,
} as const;

const MenuIcon = () => (
  <svg {...iconProps} className="frame-menu__icon">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

const CloseIcon = () => (
  <svg {...iconProps} className="frame-menu__icon">
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

// The site renders it as an item of its header's link list (as="li"), so the
// hidden menu adds no slot to that list at full width; the docs render it as
// a navbar item of its own.
export const HeaderMenu = ({
  links,
  as: Root = "div",
}: {
  links: FrameLink[];
  as?: "div" | "li";
}) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const send = (event: MenuEvent) => setOpen((current) => nextMenuState(current, event));

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      send("escape");
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) send("outside");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const label = open ? "Close menu" : "Open menu";
  return (
    <Root className="frame-menu" ref={root as never}>
      <button
        ref={button}
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={label}
        className="frame-menu__button"
        onClick={() => send("toggle")}
        title={label}
        type="button"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      <nav aria-label="Menu" className="frame-menu__panel" hidden={!open} id={panelId}>
        <ul className="frame-menu__links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => send("link")}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Root>
  );
};
