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
import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import { fontFaceCss, fontUrl, PRELOAD_FONTS } from "@cryptos-pki/frame/fonts";

import { themeInitScript } from "./theme";

import "./app.css";

const base = import.meta.env.BASE_URL;

// The frame's font faces, written with the base path so a sub-path build
// (the previews) still finds /fonts/ under it.
const fontFaces = fontFaceCss(base);

export function Layout({ children }: { children: ReactNode }) {
  return (
    // Dark is the default. The head script switches <html> to a stored light
    // choice before React hydrates, so it differs from the prerendered markup
    // on purpose.
    <html
      lang="en"
      className="dark"
      data-theme="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
        <link rel="apple-touch-icon" href={`${base}apple-touch-icon.png`} />
        <style dangerouslySetInnerHTML={{ __html: fontFaces }} />
        {PRELOAD_FONTS.map((font) => (
          <link
            key={font}
            rel="preload"
            href={fontUrl(base, font)}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
