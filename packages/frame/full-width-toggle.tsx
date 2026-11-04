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
// The full-width content switch for a docs header (full-width.ts): a
// pressed or unpressed button in the nav type, beside the version picker.
// Drawn with plain classes from site-frame.css.

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

// Arrows out to the sides (widen) and in from them (narrow).
const Widen = () => (
  <svg {...iconProps} className="width-toggle__icon">
    <path d="M3 12h7M3 12l3-3M3 12l3 3" />
    <path d="M21 12h-7M21 12l-3-3M21 12l-3 3" />
  </svg>
);

const Narrow = () => (
  <svg {...iconProps} className="width-toggle__icon">
    <path d="M10 12H3M10 12l-3-3M10 12l-3 3" />
    <path d="M14 12h7M14 12l3-3M14 12l3 3" />
  </svg>
);

export const FullWidthToggle = ({ full, onToggle }: { full: boolean; onToggle: () => void }) => (
  <button
    aria-pressed={full}
    className="width-toggle"
    onClick={onToggle}
    title={full ? "Narrow the content back to the page column" : "Widen the content to the window"}
    type="button"
  >
    {full ? <Narrow /> : <Widen />}
    <span className="width-toggle__label">Full width</span>
  </button>
);
