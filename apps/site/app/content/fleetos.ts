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
// The FleetOS Manager page. Every statement here is checked against
// cryptos-manager and cryptos-web main; anything on main but not yet on a
// published tag carries `next: true` and is labelled as such on the page.

export interface FleetItem {
  title: string;
  body: string;
  // On main, not yet on a published release.
  next?: boolean;
}

export interface FleetStep {
  title: string;
  steps: string[];
}

export interface StorageMode {
  mode: string;
  setting: string;
  use: string;
  persists: string;
  next?: boolean;
}

export interface DocLink {
  label: string;
  href: string;
}

// The FleetOS Manager docs this page sends readers to, on the docs base the
// site was built with (the live docs, or a preview's), so both work. These
// pages are in the released docs version, not only in Next.
export const fleetDocs = (docs: string): DocLink[] => [
  { label: "Deploy with Helm", href: `${docs}/docs/fleet/helm` },
  { label: "First run", href: `${docs}/docs/fleet/first-run` },
  { label: "All FleetOS Manager docs", href: `${docs}/docs/fleet` },
];

export const fleetos = {
  meta: {
    description:
      "FleetOS Manager is the optional console and API for a fleet of CryptOS nodes: adopt and link nodes, approve requests, issue and revoke through the node that holds the CA, and keep a hash-chained audit trail.",
  },
  intro: {
    eyebrow: "FleetOS Manager",
    heading: "One console for every CryptOS node you link.",
    lede: "FleetOS Manager is the optional control plane for a CryptOS fleet. It shows every linked node, carries requests to the node that holds the CA, and records who did what. The nodes keep working without it, and it never holds a CA private key.",
  },
  sections: [
    { label: "What it is", href: "#what-it-is" },
    { label: "How a node joins", href: "#joining" },
    { label: "Approvals", href: "#approvals" },
    { label: "Issuing and revoking", href: "#issuing" },
    { label: "Console and CLI", href: "#console" },
    { label: "Storage", href: "#storage" },
    { label: "Ways to run it", href: "#run" },
  ],
  whatItIs: {
    heading: "A Go service with the console built in.",
    lede: "One binary, one TLS listener: the fleet API and the web console are served from the same port.",
    items: [
      {
        title: "One listener",
        body: "The fleet API speaks Connect, gRPC and gRPC-Web on the same TLS listener that serves the web console. The console is built from cryptos-web and embedded in the binary.",
      },
      {
        title: "The node signs, not the manager",
        body: "Every certificate is issued and revoked on the CryptOS node that holds the CA key. The manager forwards the request and the CSR; it holds no CA private key.",
      },
      {
        title: "Certificates, not passwords",
        body: "Operators sign in with a client certificate from your own operator CA, at viewer, operator or admin level. It is re-checked on every request against the manager's denylist, the CA's CRL and, where set, OCSP.",
      },
      {
        title: "A hash-chained audit log",
        body: "Every change is recorded with the operator who made it, in a log where each entry is chained to the one before.",
      },
    ] satisfies FleetItem[],
  },
  joining: {
    heading: "Both sides check each other before a node joins.",
    lede: "A node is never trusted on its word. An admin confirms what the node presents, and the node accepts only the credential the manager made for it.",
    flows: [
      {
        title: "Adopt a fresh node",
        steps: [
          "An admin points the adopt wizard at a node waiting in maintenance mode. The manager shows the certificate fingerprint the node presents, and the admin confirms it.",
          "The manager mints an admin credential for that node and installs CryptOS to a disk the node reports.",
          "The node reboots into its installed system and presents a new management certificate. The adoption pauses until an admin matches its fingerprint against the Mgmt SHA-256 line on the node's console.",
          "The manager runs the first-boot ceremony and registers the node.",
        ],
      },
      {
        title: "Link a node that is already running",
        steps: [
          "An operator gives the manager the node's address, an admin credential for it and the CA certificate its management certificate chains to.",
          "The manager connects and refuses the node unless its certificate verifies against that CA.",
          "The node signs a random challenge with its CA identity key. The manager checks the signature and pins the key's fingerprint.",
          "The link waits as PENDING until an admin approves it. On approval the manager checks the node again against the pin, and the node's own operator surface becomes read-only.",
        ],
      },
      {
        title: "Sign a subordinate CA",
        steps: [
          "An operator asks for a child CA to be signed by a parent CA in the fleet, under a named profile.",
          "The request waits as PENDING until an admin approves it.",
          "The manager carries the child's CSR to the parent node and the signed certificate back. The parent signs; the manager only carries.",
        ],
      },
    ] satisfies FleetStep[],
    after:
      "Removing a node is explicit. Decommission wipes the node's identity and data and reboots it into maintenance, and only goes ahead when the admin types the node's Root CA name. Remove drops the node from the inventory and leaves the node alone.",
  },
  approvals: {
    heading: "Requests wait for a person.",
    lede: "Approvals are one person's decision today, and nobody approves their own request.",
    items: [
      {
        title: "Certificate requests",
        body: "A viewer can file a CSR against a profile an admin has marked requestable. An operator or admin approves or denies it, never the requester. A request that isn't decided expires after 30 days.",
      },
      {
        title: "Agent step-ups",
        body: "When an AI agent on the optional MCP endpoint asks for something sensitive, such as a revocation or a profile change, it gets an approval link instead. Each approval covers that one exact request, runs once and expires after 15 minutes.",
      },
      {
        title: "Link and subordinate requests",
        body: "Linking a running node and signing a subordinate CA both wait as PENDING until an admin approves them.",
      },
    ] satisfies FleetItem[],
  },
  issuing: {
    heading: "Issue and revoke through the node that holds the CA.",
    lede: "The manager is a window onto the fleet, not a CA of its own.",
    items: [
      {
        title: "Issue",
        body: "An operator issues an end-entity certificate from a node's profile. Only the CSR crosses to the node; the key stays with whoever made it.",
      },
      {
        title: "Revoke",
        body: "An operator revokes by serial. The node that issued the certificate revokes it, and its CRL and OCSP responder carry the change where you have turned them on.",
      },
      {
        title: "Inventory",
        body: "The certificate list gathers every linked node's certificates in one place, with chain validation and per-node detail.",
      },
      {
        title: "Rekey and protocols",
        body: "An admin can rekey a node's CA and switch ACME or EST on or off per node. A protocol switch applies at the node's next reboot, and the manager shows it as waiting until the node reports it running.",
      },
    ] satisfies FleetItem[],
  },
  console: {
    heading: "A web console and a command line.",
    lede: "The same checks apply to both: your client certificate decides what you can do.",
    pages: [
      "Dashboard and fleet topology",
      "Nodes, with each node's config, profiles, certificates and rekey",
      "Root CAs",
      "Adopt a node",
      "Enrollment requests",
      "Certificates",
      "Profiles",
      "Protocols",
      "Approvals",
      "Operators and operator CAs",
      "Agent keys",
      "Audit log",
    ],
    cli: {
      title: "cryptos-managerctl",
      body: "An operator command line for the same API, for Linux, macOS and Windows, with JSON or YAML output for scripts.",
      next: true,
      commands: [
        "cryptos-managerctl whoami",
        "cryptos-managerctl nodes list|get",
        "cryptos-managerctl certs list|get|issue|revoke",
        "cryptos-managerctl enrollments list|approve|reject",
        "cryptos-managerctl approvals list|approve|deny",
        "cryptos-managerctl profiles list",
      ],
    },
  },
  storage: {
    heading: "Bring your own database, or none.",
    lede: "The manager connects to storage you run; it never ships or manages a database. With no storage configured it refuses to start, rather than fall back silently.",
    modes: [
      {
        mode: "PostgreSQL",
        setting: "database_url",
        use: "The default, for any real deployment.",
        persists: "Yes",
      },
      {
        mode: "Key-value (Valkey or Redis)",
        setting: "storage.mode: kv",
        use: "When you already run Valkey or Redis. The server must persist with AOF; without persistence the manager won't start.",
        persists: "Yes",
        next: true,
      },
      {
        mode: "Memory",
        setting: "storage.mode: memory",
        use: "Trying it out. One replica only, first run and MCP are off, and health reports degraded.",
        persists: "No, everything is lost on restart",
      },
    ] satisfies StorageMode[],
  },
  run: {
    heading: "Three ways to run it.",
    lede: "One self-contained image or binary, wherever suits you.",
    items: [
      {
        title: "Kubernetes",
        body: "The Helm chart, published on every release to oci://ghcr.io/cryptos-pki/charts/fleet-manager.",
      },
      {
        title: "A container",
        body: "docker run, or the compose file with a PostgreSQL you own on the same host. Images are published to ghcr.io/cryptos-pki/cryptos-manager.",
      },
      {
        title: "A binary under systemd",
        body: "Standalone on a VM, with no container runtime at all and a PostgreSQL you provide.",
      },
      {
        title: "amd64 and arm64",
        body: "The image is built for linux/amd64 and linux/arm64, so the same tag runs on an x86 host or an ARM board.",
        next: true,
      },
    ] satisfies FleetItem[],
    docsLead: "The deployment guide is in the FleetOS Manager docs:",
  },
  nextLabel: "Next release",
  nextNote: "Marked Next release: on main and in the next release candidate, not in v0.1.0-rc.1.",
};
