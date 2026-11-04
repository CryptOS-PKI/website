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
import type { Control, ControlStatus, Evidence, IssueRef } from "./types.ts";

const org = "https://github.com/CryptOS-PKI";

export const evidenceHref = (e: Evidence) => `${org}/${e.repo}/blob/main/${e.path}`;

export const issueHref = (i: IssueRef) => `${org}/${i.repo}/issues/${i.number}`;

export const issueLabel = (i: IssueRef) => `${i.repo}#${i.number}`;

// The chip names, as the filter shows them.
export const STATUS_NAMES: Record<ControlStatus, string> = {
  implemented: "Implemented",
  partial: "Partial",
  planned: "Planned",
  "not-planned": "Not planned",
};

// The badge on one control: the chip name, plus the release it first shipped in.
export const statusLabel = (c: Pick<Control, "status" | "since">) => {
  const name = STATUS_NAMES[c.status];
  if (!c.since || (c.status !== "implemented" && c.status !== "partial")) return name;
  return `${name} in ${c.since}`;
};
