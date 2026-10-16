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
import type { Config } from "@react-router/dev/config";

// Prerender the one route to static HTML at build time, no Node server at
// request time -- ssr: false plus a prerender list is React Router v7's
// static-site-generation mode.
export default {
  ssr: false,
  async prerender() {
    return ["/"];
  },
} satisfies Config;
