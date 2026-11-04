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
// Splits the trailing word off a line of text so a caller can pair it with a
// trailing decorative mark (an emoji) inside a `white-space: nowrap` span,
// keeping the two from ever landing on separate lines.
export function splitTrailingWord(text: string): [lead: string, tail: string] {
  const trimmed = text.trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) return ["", trimmed];
  return [trimmed.slice(0, lastSpace + 1), trimmed.slice(lastSpace + 1)];
}
