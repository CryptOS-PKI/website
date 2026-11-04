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
// Takes emoji out of a label or heading, for navigation that reads as plain
// text (the docs sidebar and table of contents) while the page itself keeps
// them. Only what renders as emoji goes: characters that default to emoji
// presentation, or any pictograph forced to it with U+FE0F, along with their
// skin-tone modifiers and joined sequences. Text symbols such as the trademark,
// copyright and registered signs, and arrows, stay.
const EMOJI =
  /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\u{FE0F})(?:\p{Emoji_Modifier}|\u{FE0F}|\u{200D}(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\u{FE0F}?))*\s*/gu;

export function stripEmoji(text: string): string {
  return text.replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();
}
