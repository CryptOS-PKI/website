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
// The one content model behind the Trust Center and the security review. Both
// render from these types; neither page carries copy of its own.

// implemented: built and on main. partial: built, with a named gap. planned:
// not built, tracked by an open issue or the public roadmap. not-planned: a
// deliberate non-goal, with the reason it stays out.
export type ControlStatus = "implemented" | "partial" | "planned" | "not-planned";

// Every evidence and issue link points at a public CryptOS-PKI repo; the
// content test rejects any repo outside this list.
export const PUBLIC_REPOS = [
  "cryptos-node",
  "cryptos-manager",
  "cryptos-web",
  "cryptos-appliance",
  "cryptos-lab",
  "docs",
  "website",
  ".github",
] as const;

export type PublicRepo = (typeof PUBLIC_REPOS)[number];

export interface Evidence {
  repo: PublicRepo;
  path: string;
  kind: "code" | "test" | "doc" | "ci";
  // The test function, CI job or doc heading that proves the claim.
  detail?: string;
}

export interface IssueRef {
  repo: PublicRepo;
  number: number;
  title: string;
}

export interface Control {
  id: string;
  area: string;
  title: string;
  statement: string;
  status: ControlStatus;
  // The first published tag the control shipped in, where it ships in a
  // release at all (a policy such as vulnerability reporting doesn't).
  since?: string;
  evidence: Evidence[];
  gaps?: IssueRef[];
  // Why a not-planned control stays out.
  reason?: string;
}

export interface Area {
  id: string;
  title: string;
  summary: string;
}

export type DiagramId = "architecture" | "appliance-hld" | "boot-chain" | "fleet";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "flow"; title: string; steps: string[] }
  | { kind: "note"; tone: "info" | "warn"; text: string }
  | { kind: "figure"; diagram: DiagramId; number: number; caption: string };

export interface ReviewSection {
  id: string;
  title: string;
  blocks: Block[];
  // Areas whose controls are listed at the end of this section.
  areas?: string[];
}

export interface SubProcessor {
  name: string;
  purpose: string;
  data: string;
  scope: string;
}

export interface TrustDocument {
  title: string;
  summary: string;
  href: string;
  action?: string;
}
