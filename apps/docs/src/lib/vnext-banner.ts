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
// The banner on every vNext page (src/theme/DocVersionBanner). The versions
// come from packages/frame/release.ts: each docs instance passes its own
// product's release.
export function vnextBannerText({version, upcoming}: {version: string; upcoming: string}): string {
  return `This page describes planned work, or work that may ship soon in ${upcoming}. The current release is ${version}.`;
}
