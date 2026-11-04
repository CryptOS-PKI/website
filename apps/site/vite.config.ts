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
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { sharedPublic } from "./shared-public";

// See react-router.config.ts: the same PREVIEW_BASE_PATH, read here so the
// asset URLs match the router's basename in a one-off preview build.
export default defineConfig({
  base: process.env.PREVIEW_BASE_PATH || "/",
  // React Router's dev plugin pre-bundles react-router-dom whenever it can
  // resolve it, and in this workspace it resolves to the docs' Docusaurus copy
  // (v5), which breaks the dev server. In v7 react-router-dom only re-exports
  // react-router, so point it there. The site itself never imports it.
  resolve: {
    alias: { "react-router-dom": "react-router" },
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    // The fonts (packages/frame) and the marks and icons (packages/brand) are
    // served from the site root, the same as the docs serve them.
    sharedPublic([
      new URL("../../packages/frame/public/", import.meta.url).pathname,
      new URL("../../packages/brand/public/", import.meta.url).pathname,
    ]),
  ],
});
