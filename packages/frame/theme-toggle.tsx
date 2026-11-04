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
// The light and dark switch both sites put at the right end of the header:
// the kit's ThemeToggle (vendor/cryptos-ui), drawn with plain classes from
// site-frame.css so the docs, which have no Tailwind, render the same button.
// Each site owns the state: the site keeps it in localStorage and on <html>,
// the docs hand it Docusaurus's colour mode.

export type FrameTheme = "dark" | "light";

const themeToggleLabel = (theme: FrameTheme) =>
  theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

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

// The kit's IconSun and IconMoon, path for path. Both are rendered and
// site-frame.css shows the one for the theme on <html> (data-theme), so the
// right icon is there before React hydrates a prerendered page.
const Sun = () => (
  <svg {...iconProps} className="theme-toggle__icon theme-toggle__icon--sun">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.9 4.9l1.4 1.4" />
    <path d="M17.7 17.7l1.4 1.4" />
    <path d="M4.9 19.1l1.4-1.4" />
    <path d="M17.7 6.3l1.4-1.4" />
  </svg>
);

const Moon = () => (
  <svg {...iconProps} className="theme-toggle__icon theme-toggle__icon--moon">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);

export const ThemeToggle = ({ theme, onToggle }: { theme: FrameTheme; onToggle: () => void }) => {
  const label = themeToggleLabel(theme);
  return (
    <button
      aria-label={label}
      className="theme-toggle"
      onClick={onToggle}
      title={label}
      type="button"
    >
      <Sun />
      <Moon />
    </button>
  );
};
