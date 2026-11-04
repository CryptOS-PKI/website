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
// The long form behind the Trust Center. The controls tables at the end of
// each section come from controls.ts, so a claim lives in one place. Every
// figure and table here is traced to cryptos-node, cryptos-appliance and
// cryptos-manager main.
import type { ReviewSection } from "./types.ts";

const sections: ReviewSection[] = [
  {
    id: "scope",
    title: "1. Scope and how to read this review",
    blocks: [
      {
        kind: "p",
        text: "CryptOS is an immutable, API-driven PKI operating system. A node boots a signed kernel image into a read-only root, keeps its CA key in the TPM, and is managed only over a mutually authenticated gRPC API. FleetOS Manager is an optional console for many nodes. You run both yourself; the project operates no service and never receives your keys.",
      },
      {
        kind: "p",
        text: "This review covers the v0.1.0 release train, currently at release candidate 1. Implemented means the code is on main, with the release it first shipped in. Partial means it is built with a named gap. Planned means it isn't built. Not planned means it is left out on purpose.",
      },
      {
        kind: "note",
        tone: "warn",
        text: "CryptOS is pre-1.0. Ceremonies are one person today, high-availability pairs and split-custody recovery aren't built, and a TPM-held CA key can't be backed up. They are described plainly in their sections and collected in Gaps and planned work.",
      },
    ],
  },
  {
    id: "architecture",
    title: "2. Architecture and trust boundaries",
    areas: ["architecture", "issuance"],
    blocks: [
      {
        kind: "p",
        text: "A node is one Go program running as PID 1. It serves the management API, the enrolment protocols you turn on, revocation and time-stamping, and keeps its state in an embedded etcd on the encrypted state partition. There is no shell, no SSH server and no login.",
      },
      {
        kind: "figure",
        diagram: "architecture",
        number: 1,
        caption:
          "Architecture and trust boundaries. Everything off the box reaches the node only through the listeners on its edge; the break-glass socket and etcd never leave it. Solid arrows are calls; dashed arrows are reads and writes on the box.",
      },
      {
        kind: "table",
        head: ["Surface", "Port and transport", "Who can reach it"],
        rows: [
          [
            "Management API",
            "443, gRPC over TLS 1.3, client certificate required",
            "Only the admin certificate pinned in the machine config: cryptosctl, or FleetOS Manager holding that node's credential",
          ],
          [
            "Break-glass socket",
            "/run/cryptos.sock, UNIX socket, no TLS",
            "Software on the box only: the local dashboard and cryptosctl run there",
          ],
          ["ACME", "8555, HTTP", "Enrolment clients, when ACME is on; never on a Root"],
          ["EST", "8443, TLS", "Enrolment clients, when EST is on; never on a Root"],
          ["SCEP", "80, HTTP", "Enrolment clients, when SCEP is on; never on a Root"],
          ["Time-stamping", "318, HTTP", "Requesters, when the TSA is on; never on a Root"],
          [
            "CRL, OCSP, CA certificate",
            "80, HTTP",
            "Relying parties, when a revocation base URL is set",
          ],
          [
            "Maintenance mode",
            "443, TLS, no client certificate",
            "Only before install, to adopt or install the node",
          ],
        ],
      },
      {
        kind: "p",
        text: "Trust domains: the node trusts one pinned admin certificate for management; its own CA chain for what it issues; and FleetOS Manager's operators are signed by a separate operator CA that the node never sees.",
      },
    ],
  },
  {
    id: "appliance",
    title: "3. The appliance",
    areas: ["appliance"],
    blocks: [
      {
        kind: "p",
        text: "The image is a unified kernel image (UKI): systemd-stub, the Linux kernel, a command line with lockdown=confidentiality, and a small initrd that carries a SquashFS root, mounts it read-only and switches into it. The kernel has no loadable modules.",
      },
      {
        kind: "figure",
        diagram: "appliance-hld",
        number: 2,
        caption:
          "The appliance, from firmware to the CA. Firmware boots the UKI you signed; the UKI mounts the read-only root; init runs the CA. The installer writes two partitions, and the TPM unseals the second.",
      },
      {
        kind: "table",
        head: ["Part", "What it is", "Written"],
        rows: [
          [
            "EFI system partition (p1)",
            "FAT, 512 MiB: the UKI and EFI/cryptos/machine.yaml",
            "By the installer and by signed upgrades",
          ],
          [
            "Root filesystem",
            "SquashFS inside the UKI: init, cryptosctl, cryptos-console, cryptsetup and disk tools",
            "Never; mounted read-only",
          ],
          [
            "State partition (p2)",
            "LUKS2, aes-xts-plain64, argon2id, ext4 at /var/lib/cryptos: config, etcd, audit",
            "By the node, only after the TPM unseals it",
          ],
        ],
      },
      {
        kind: "p",
        text: "There is one network interface: management binds its configured address, and the protocol listeners bind all addresses. The local console shows a read-only status screen and has no login prompt.",
      },
    ],
  },
  {
    id: "custody",
    title: "4. Boot chain and TPM key custody",
    areas: ["keys", "ceremonies"],
    blocks: [
      {
        kind: "figure",
        diagram: "boot-chain",
        number: 3,
        caption:
          "Boot chain and TPM key custody. Firmware records Secure Boot state in PCR 7 and systemd-stub measures the UKI into PCR 11; the state key unseals only for those values. The CA key is made inside the TPM and only its wrapped blob is stored.",
      },
      {
        kind: "table",
        head: ["Key", "Algorithm", "Where it lives"],
        rows: [
          ["Storage root key", "ECC P-256", "Persistent in the TPM at 0x81000001"],
          [
            "State disk key",
            "LUKS2, aes-xts-plain64, 512-bit",
            "Sealed in the TPM under PolicyPCR 7 + 11; blob in LUKS2 token 0",
          ],
          [
            "CA key (TPM mode)",
            "ECDSA P-384 with SHA-384, or RSA 3072+",
            "Created in the TPM under the SRK; wrapped blob in etcd; export refused",
          ],
          [
            "CA key (nodeid or kms mode)",
            "As above",
            "In software on the encrypted partition, not hardware-protected",
          ],
          ["Ceremony manifest key", "Ed25519", "Derived on the node; signs the ceremony record"],
          ["Secure Boot key", "RSA, yours", "Off the box: you sign the UKI with it"],
        ],
      },
      {
        kind: "flow",
        title: "First boot to a Root",
        steps: [
          "The node boots in maintenance mode and installs to disk, staging the machine config on the EFI partition.",
          "The installed node encrypts its state partition and seals the key to PCR 7 and 11.",
          "Over the channel pinned to the admin certificate, the ceremony provisions the SRK and creates the CA key inside the TPM.",
          "The node self-signs the Root certificate, signs the ceremony manifest, and commits both to etcd in one step.",
        ],
      },
      {
        kind: "note",
        tone: "info",
        text: "An image upgrade predicts the new PCR 11 and reseals the state key before anything is written, so a signed upgrade keeps the disk readable and a tampered one doesn't.",
      },
    ],
  },
  {
    id: "fleet",
    title: "5. FleetOS Manager and the fleet",
    areas: ["fleet", "access"],
    blocks: [
      {
        kind: "p",
        text: "FleetOS Manager is a Go service with the web console built in, on one HTTPS listener. Operators sign in with a client certificate from your own operator CA. The manager connects out to each node over mTLS on port 443 with that node's admin credential; nodes never call the manager.",
      },
      {
        kind: "figure",
        diagram: "fleet",
        number: 4,
        caption:
          "FleetOS Manager and the fleet. A fresh node is adopted once an admin confirms its fingerprint; a running node's link waits as pending until an admin approves it. The manager carries requests to the node that holds the CA and signs nothing for it.",
      },
      {
        kind: "flow",
        title: "Adopt a fresh node",
        steps: [
          "An admin points the manager at a node in maintenance mode and confirms the certificate fingerprint it presents.",
          "The manager mints a P-256 clientAuth admin credential for the node and installs CryptOS to the disk the node reports.",
          "After the reboot the adoption pauses until an admin matches the new management certificate against the Mgmt SHA-256 line on the node's console.",
          "The manager runs the first-boot ceremony and registers the node.",
        ],
      },
      {
        kind: "flow",
        title: "Link a running node",
        steps: [
          "An operator supplies the node's address, an admin credential and the CA its management certificate chains to.",
          "The manager refuses the node unless its certificate verifies, then has it sign a random challenge (SHA-384) with its CA key and pins that key.",
          "The link is recorded as PENDING.",
          "An admin approves; the manager checks the node against the pin again, and the node's own operator surface becomes read-only.",
        ],
      },
      {
        kind: "table",
        head: ["Storage mode", "Setting", "Persists"],
        rows: [
          ["PostgreSQL", "database_url", "Yes"],
          [
            "Valkey or Redis (next release)",
            "storage.mode: kv",
            "Yes, with AOF; refuses to start without persistence",
          ],
          ["Memory", "storage.mode: memory", "No; one replica, health reports degraded"],
        ],
      },
    ],
  },
  {
    id: "audit",
    title: "6. Audit, availability and recovery",
    areas: ["audit", "availability"],
    blocks: [
      {
        kind: "p",
        text: "Each node keeps a SHA-256 hash-chained audit log, signed with a key kept apart from the CA key, which cryptosctl can verify. FleetOS Manager keeps its own hash-chained log with the acting operator and any approver.",
      },
      {
        kind: "p",
        text: "A node is a single machine today. A TPM-held CA key can't leave the TPM, so it can't be escrowed; losing that node's TPM loses that CA. Software keys can be escrowed in a passphrase envelope. Pairs with failover and split-custody recovery are on the roadmap.",
      },
    ],
  },
  {
    id: "supply-chain",
    title: "7. Supply chain and development",
    areas: ["supply-chain"],
    blocks: [
      {
        kind: "p",
        text: "Release images are built twice and compared byte for byte, and ship with SHA256SUMS and a build manifest. They ship unsigned on purpose: you sign the UKI with your own Secure Boot key, so no project key sits in your chain of trust.",
      },
      {
        kind: "p",
        text: "Every change goes through a pull request with CI: Go formatting, lint, vet and tests with a software TPM, interop tests against standard clients, and secret scanning.",
      },
    ],
  },
];

export const review = {
  title: "CryptOS Security Review",
  subtitle:
    "Architecture, appliance design, boot chain, key custody and the fleet of a self-hosted PKI operating system, with the evidence behind each claim.",
  docVersion: "Draft 1",
  date: "4 November 2026",
  productVersion: "v0.1.0-rc.1 (prerelease), and main where marked",
  classification: "Public",
  disclaimer:
    "CryptOS holds no SOC 2 report, ISO 27001 certificate or other certification. This review describes only what is built, links the code and tests behind each claim so an independent reviewer can check it, and lists every known gap. Where a control depends on how you deploy CryptOS, it says so.",
  gapsIntro:
    "Every control that is partial or planned, with the open issue or roadmap entry that tracks it. Nothing here is promised for a date.",
  nonGoalsIntro:
    "What CryptOS leaves out on purpose, and why. These aren't gaps waiting for a fix.",
  sections,
};
