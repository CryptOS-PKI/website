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
import { type FrameLinks, stripHtml } from "@cryptos-pki/frame/strip";

import "./marketing.css";

// The strip above the header: the release and pre-1.0 note from
// packages/frame, the same markup the docs pass to their announcement bar,
// so the two sites draw it identically.
export const Strip = ({ links }: { links: FrameLinks }) => (
  <div
    className="strip"
    role="note"
    aria-label="Release status"
    dangerouslySetInnerHTML={{ __html: stripHtml(links) }}
  />
);
