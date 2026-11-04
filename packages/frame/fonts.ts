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
// The frame's self-hosted fonts (public/fonts, SIL Open Font License) as
// font-face rules written with the site's base path. A url() in
// site-frame.css can't know the base, so a site served under a sub-path (the
// previews) would look for /fonts/ at the server root; each site passes its
// own base here and puts the rules in its <head> instead. Both sites get the
// same files at the same URLs under their base.

export interface FrameFont {
  family: "Inter Variable" | "JetBrains Mono";
  weight: string;
  file: string;
  subset: "latin" | "latin-ext";
}

const UNICODE_RANGE: Record<FrameFont["subset"], string> = {
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  "latin-ext":
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
};

export const FRAME_FONTS: FrameFont[] = [
  {
    family: "Inter Variable",
    weight: "100 900",
    file: "inter-latin-ext.woff2",
    subset: "latin-ext",
  },
  { family: "Inter Variable", weight: "100 900", file: "inter-latin.woff2", subset: "latin" },
  {
    family: "JetBrains Mono",
    weight: "400",
    file: "jetbrains-mono-400-latin-ext.woff2",
    subset: "latin-ext",
  },
  {
    family: "JetBrains Mono",
    weight: "400",
    file: "jetbrains-mono-400-latin.woff2",
    subset: "latin",
  },
  {
    family: "JetBrains Mono",
    weight: "500",
    file: "jetbrains-mono-500-latin-ext.woff2",
    subset: "latin-ext",
  },
  {
    family: "JetBrains Mono",
    weight: "500",
    file: "jetbrains-mono-500-latin.woff2",
    subset: "latin",
  },
  {
    family: "JetBrains Mono",
    weight: "700",
    file: "jetbrains-mono-700-latin-ext.woff2",
    subset: "latin-ext",
  },
  {
    family: "JetBrains Mono",
    weight: "700",
    file: "jetbrains-mono-700-latin.woff2",
    subset: "latin",
  },
];

// The fonts the strip, header and footer draw with, preloaded on both sites
// so the frame never paints in a fallback face first.
export const PRELOAD_FONTS = ["inter-latin.woff2", "jetbrains-mono-700-latin.woff2"];

const withSlash = (base: string) => (base.endsWith("/") ? base : `${base}/`);

export const fontUrl = (base: string, file: string) => `${withSlash(base)}fonts/${file}`;

export const fontFaceCss = (base: string) =>
  FRAME_FONTS.map(
    (font) =>
      `@font-face{font-family:"${font.family}";font-style:normal;font-weight:${font.weight};` +
      `font-display:swap;src:url("${fontUrl(base, font.file)}") format("woff2");` +
      `unicode-range:${UNICODE_RANGE[font.subset]};}`,
  ).join("\n");
