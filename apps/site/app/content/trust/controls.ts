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
// The control register. Each entry says what is built, the release it first
// shipped in, the files and tests that prove it, and the open work that
// covers what is missing. Every path and test name here was checked against
// each repo's main branch when it was written.
import type { Area, Control } from "./types.ts";

const RC1 = "v0.1.0-rc.1";
const roadmap = "apps/docs/docs/introduction/status-roadmap.md";

export const areas: Area[] = [
  {
    id: "architecture",
    title: "Architecture and trust boundaries",
    summary:
      "No shell and no login: one mutually authenticated API, and a break-glass socket that never leaves the box.",
  },
  {
    id: "keys",
    title: "Keys and TPM custody",
    summary:
      "CA keys made and used inside the TPM, and a state disk that only the expected boot chain can open.",
  },
  {
    id: "ceremonies",
    title: "Ceremonies and quorum",
    summary:
      "How a Root comes into being, what records it, and what still needs more than one person.",
  },
  {
    id: "issuance",
    title: "Issuance and protocols",
    summary: "Every path to a certificate runs through one profile engine, held to the RFCs.",
  },
  {
    id: "access",
    title: "Identity, access and approvals",
    summary:
      "One pinned admin on each node; certificate-based roles and approvals in FleetOS Manager.",
  },
  {
    id: "audit",
    title: "Audit trail",
    summary:
      "Hash-chained, signed logs on the node and in the manager, and what they don't do yet.",
  },
  {
    id: "appliance",
    title: "Appliance platform",
    summary: "A read-only image you sign yourself, with signed upgrades and a guarded clock.",
  },
  {
    id: "fleet",
    title: "FleetOS Manager",
    summary: "An optional console that carries requests to the nodes and never holds a CA key.",
  },
  {
    id: "availability",
    title: "Availability and recovery",
    summary:
      "What happens when a node is lost: escrow for software keys today, pairs and split custody later.",
  },
  {
    id: "supply-chain",
    title: "Supply chain and development",
    summary:
      "Reproducible, unsigned releases, secret scanning, CI gates and how to report a vulnerability.",
  },
];

export const controls: Control[] = [
  // Architecture and trust boundaries
  {
    id: "ARC-1",
    area: "architecture",
    title: "No interactive access",
    statement:
      "A node has no SSH server, login prompt, shell or user accounts. The kernel is built without loadable modules and boots with lockdown=confidentiality.",
    status: "implemented",
    since: RC1,
    evidence: [
      {
        repo: "cryptos-appliance",
        path: "build/kernel/cryptos.config",
        kind: "code",
        detail: "CONFIG_MODULES unset, forced lockdown",
      },
      {
        repo: "cryptos-appliance",
        path: "build/uki/assemble.sh",
        kind: "code",
        detail: "kernel command line",
      },
      { repo: "website", path: "apps/docs/docs/concepts/immutable-no-login.md", kind: "doc" },
    ],
  },
  {
    id: "ARC-2",
    area: "architecture",
    title: "Remote management is mutual TLS only",
    statement:
      "The management API is gRPC over TLS 1.3 with a client certificate required. A certificate that doesn't match the node's pinned admin is refused.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/grpc/authz.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/grpc/authz_test.go",
        kind: "test",
        detail: "TestAuthorizeAdmin_MismatchIsPermissionDenied",
      },
      { repo: "cryptos-node", path: "internal/init/servertls.go", kind: "code" },
    ],
  },
  {
    id: "ARC-3",
    area: "architecture",
    title: "Break-glass socket on the box only",
    statement:
      "An unauthenticated UNIX socket serves the same API for on-box use only, with no network listener behind it. An unauthenticated reset works only there; over the network, reset needs the admin and the Root CA name typed back.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/grpc/authz.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/grpc/authz_test.go",
        kind: "test",
        detail: "TestAuthorizeAdmin_LocalNoPeer",
      },
      { repo: "website", path: "apps/docs/docs/deep-dives/trust-from-zero.md", kind: "doc" },
    ],
  },
  {
    id: "ARC-4",
    area: "architecture",
    title: "Embedded state store on loopback",
    statement:
      "The node's etcd listens on 127.0.0.1 only and keeps its data on the encrypted state partition.",
    status: "implemented",
    since: RC1,
    evidence: [{ repo: "cryptos-node", path: "internal/storage/etcd/etcd.go", kind: "code" }],
  },
  {
    id: "ARC-5",
    area: "architecture",
    title: "No web interface in the OS image",
    statement:
      "The node serves no web front end, compiled or otherwise. A web console exists only in FleetOS Manager, which runs off the node.",
    status: "not-planned",
    reason:
      "Every web stack on the CA is more code that could be attacked. Nodes stay API-only by design.",
    evidence: [{ repo: "cryptos-node", path: "README.md", kind: "doc" }],
  },
  {
    id: "ARC-6",
    area: "architecture",
    title: "No cross-signing between Roots",
    statement:
      "Each Root is its own trust domain. CryptOS doesn't cross-sign one Root with another.",
    status: "not-planned",
    reason:
      "Siloed Roots keep a compromise of one hierarchy from reaching another. It stays out until a real need appears.",
    evidence: [{ repo: "website", path: "apps/docs/docs/concepts/ca-roles.md", kind: "doc" }],
  },

  // Keys and TPM custody
  {
    id: "KEY-1",
    area: "keys",
    title: "CA keys are made and used inside the TPM",
    statement:
      "In TPM mode the CA key is created inside the TPM under its storage root key, only its wrapped blob is stored, and export is refused.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/tpm/key.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/init/escrow_test.go",
        kind: "test",
        detail: "TestExportRefusedWhenNotExportable",
      },
      { repo: "website", path: "apps/docs/docs/deep-dives/keys-never-leave-tpm.md", kind: "doc" },
    ],
  },
  {
    id: "KEY-2",
    area: "keys",
    title: "The state disk is sealed to the boot chain",
    statement:
      "The LUKS2 state partition's key is sealed in the TPM to PCR 7 (Secure Boot) and PCR 11 (the signed kernel image). A changed boot chain can't unseal it.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/tpm/seal.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/tpm/seal_test.go",
        kind: "test",
        detail: "TestUnseal_FailsAfterPCRDrift",
      },
      { repo: "website", path: "apps/docs/docs/concepts/tpm-sealed-keys.md", kind: "doc" },
    ],
  },
  {
    id: "KEY-3",
    area: "keys",
    title: "Sealing follows upgrades and rollbacks",
    statement:
      "Before an upgrade or rollback, the node predicts the new PCR 11 and reseals the state key for exactly the images it can boot, adding before it removes.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/init/statekeyreseal.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/init/statekeyreseal_test.go",
        kind: "test",
        detail: "TestReseal_KeyFollowsAnUpgradeAndItsRollback",
      },
    ],
  },
  {
    id: "KEY-4",
    area: "keys",
    title: "Strong CA key algorithms only",
    statement:
      "CA keys in the TPM are ECDSA P-384 with SHA-384, or RSA of at least 3072 bits. Anything smaller is refused.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/tpm/key.go", kind: "code", detail: "MinRSAKeyBits" },
      {
        repo: "cryptos-node",
        path: "internal/tpm/keyalg_test.go",
        kind: "test",
        detail: "TestPublicTemplateRSAFloor",
      },
    ],
  },
  {
    id: "KEY-5",
    area: "keys",
    title: "Software key modes are labelled as such",
    statement:
      "The nodeid (development) and kms modes keep the CA key in software on the encrypted partition, not in the TPM, and the code and docs say so plainly.",
    status: "partial",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/init/softroot.go", kind: "code" },
      { repo: "cryptos-node", path: "internal/config/config.go", kind: "code" },
    ],
  },
  {
    id: "KEY-6",
    area: "keys",
    title: "No network HSM for CA keys",
    statement:
      "CA keys live only in the node's own TPM; a network HSM or PKCS#11 device for CA keys is out of scope. The kms mode wraps only the state disk's key with an external KMS. Saying so plainly in the docs is planned.",
    status: "planned",
    evidence: [],
    gaps: [
      {
        repo: "website",
        number: 42,
        title: "Say that CA keys stay in the TPM and a network HSM is out of scope",
      },
    ],
  },

  // Ceremonies and quorum
  {
    id: "CER-1",
    area: "ceremonies",
    title: "First-boot Root ceremony",
    statement:
      "A Root key and its self-signed certificate are made in a first-boot ceremony, authorised by the admin certificate pinned in the machine config.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/ceremony/ceremony.go", kind: "code" },
      { repo: "website", path: "apps/docs/docs/deep-dives/ceremony-walkthrough.md", kind: "doc" },
    ],
  },
  {
    id: "CER-2",
    area: "ceremonies",
    title: "Signed ceremony manifest",
    statement:
      "The ceremony writes an Ed25519-signed manifest, and tampering with it is detected. The signing key is derived on the node; it isn't an operator's signature.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/ceremony/ceremony.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/ceremony/ceremony_test.go",
        kind: "test",
        detail: "TestVerifyManifest_Tamper",
      },
    ],
  },
  {
    id: "CER-3",
    area: "ceremonies",
    title: "M-of-N quorum for Root operations",
    statement:
      "Ceremonies are one person today. Requiring M of N key holders for Root operations isn't built.",
    status: "planned",
    evidence: [],
    gaps: [{ repo: "cryptos-node", number: 371, title: "Build M-of-N quorum ceremonies" }],
  },
  {
    id: "CER-4",
    area: "ceremonies",
    title: "Guarded factory reset",
    statement:
      "A reset needs the Root CA name typed back, compared in constant time, and fails closed. A quorum and one-time-code gate on top of it is planned.",
    status: "partial",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/reset/reset.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/reset/reset_test.go",
        kind: "test",
        detail: "TestWipeEmptyRootCNFailsClosed",
      },
    ],
    gaps: [
      {
        repo: "cryptos-node",
        number: 361,
        title: "Require M-of-N quorum plus holder codes for a factory reset",
      },
    ],
  },

  // Issuance and protocols
  {
    id: "ISS-1",
    area: "issuance",
    title: "RFC 5280 Root certificates",
    statement:
      "The Root certificate the node self-signs is checked by zlint in the test suite with no errors and no warnings.",
    status: "implemented",
    since: RC1,
    evidence: [
      {
        repo: "cryptos-node",
        path: "internal/ca/ca_test.go",
        kind: "test",
        detail: "TestSelfSignRoot_ZLintCleanRoot",
      },
    ],
  },
  {
    id: "ISS-2",
    area: "issuance",
    title: "One profile engine for every issuance path",
    statement:
      "Every path to a certificate, the API and the ACME, EST and SCEP adapters included, goes through one profile engine that decides the extensions. A subordinate's path length is clamped to what its parent allows.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/ca/profile.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/node/signer.go",
        kind: "code",
        detail: "clampPathLen",
      },
    ],
  },
  {
    id: "ISS-3",
    area: "issuance",
    title: "No arbitrary CSR signing in production builds",
    statement:
      "The raw SignCSR call is a stub in production builds; it exists only in a debug build tag.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/grpc/signcsr_stub.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/grpc/server_test.go",
        kind: "test",
        detail: "TestSignCSR_StubReturnsUnimplemented",
      },
    ],
  },
  {
    id: "ISS-4",
    area: "issuance",
    title: "SCEP (RFC 8894)",
    statement: "SCEP enrolment, tested against the sscep client in CI.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/scep/sscep_test.go", kind: "test" },
      {
        repo: "cryptos-node",
        path: ".github/workflows/ci-go.yml",
        kind: "ci",
        detail: "Build sscep",
      },
    ],
  },
  {
    id: "ISS-5",
    area: "issuance",
    title: "ACME (RFC 8555)",
    statement:
      "ACME with http-01 and External Account Binding, and a strict JWS algorithm allow-list. dns-01, wildcards, key change and account deactivation aren't built.",
    status: "partial",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/acme/doc.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/acme/jws_test.go",
        kind: "test",
        detail: "TestVerifyJWSAlgorithmConfusion",
      },
    ],
    gaps: [
      {
        repo: "cryptos-node",
        number: 110,
        title: "ACME HTTP-01/DNS-01 for cert-manager and native clients",
      },
    ],
  },
  {
    id: "ISS-6",
    area: "issuance",
    title: "EST (RFC 7030)",
    statement: "An EST enrolment adapter over TLS.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/est/handlers.go", kind: "code" },
      { repo: "cryptos-node", path: "docs/est.md", kind: "doc" },
    ],
  },
  {
    id: "ISS-7",
    area: "issuance",
    title: "Revocation: CRL and OCSP",
    statement:
      "The node publishes an RFC 5280 CRL and answers RFC 6960 OCSP requests when a revocation URL is set.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/revocation/crl.go", kind: "code" },
      { repo: "cryptos-node", path: "internal/revocation/ocsp.go", kind: "code" },
      { repo: "cryptos-node", path: "internal/revocation/http_test.go", kind: "test" },
    ],
  },
  {
    id: "ISS-8",
    area: "issuance",
    title: "Time-stamping (RFC 3161)",
    statement: "A built-in time-stamp authority that refuses SHA-1 and MD5 message imprints.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/tsa/responder.go", kind: "code" },
      { repo: "cryptos-node", path: "internal/tsa/responder_test.go", kind: "test" },
    ],
  },
  {
    id: "ISS-9",
    area: "issuance",
    title: "Root CAs serve no enrolment protocols",
    statement:
      "Config validation refuses ACME, EST, SCEP and the TSA on a Root, so a Root never answers enrolment requests.",
    status: "implemented",
    since: RC1,
    evidence: [{ repo: "cryptos-node", path: "internal/config/protocols.go", kind: "code" }],
  },
  {
    id: "ISS-10",
    area: "issuance",
    title: "Windows autoenrolment (MS-XCEP and WSTEP)",
    statement: "Native Windows autoenrolment through Group Policy isn't built.",
    status: "planned",
    evidence: [],
    gaps: [
      {
        repo: "cryptos-node",
        number: 108,
        title: "Native Windows autoenrolment via GPO (MS-XCEP/WSTEP)",
      },
    ],
  },

  // Identity, access and approvals
  {
    id: "ACC-1",
    area: "access",
    title: "One pinned admin per node",
    statement:
      "A node trusts exactly one admin certificate, pinned in its machine config. There are no roles or accounts on the node itself.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/bootstrap/bootstrap.go", kind: "code" },
      { repo: "cryptos-node", path: "internal/grpc/authz.go", kind: "code" },
    ],
  },
  {
    id: "ACC-2",
    area: "access",
    title: "Certificate-based roles in FleetOS Manager",
    statement:
      "Operators sign in with a client certificate from your own operator CA. Viewer, operator and admin levels travel in the certificate. No passwords are stored.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-manager", path: "internal/authz/level.go", kind: "code" },
      {
        repo: "cryptos-manager",
        path: "internal/authz/level_test.go",
        kind: "test",
        detail: "TestLevelFromCertificate",
      },
      { repo: "cryptos-manager", path: "docs/operator-ca.md", kind: "doc" },
    ],
  },
  {
    id: "ACC-3",
    area: "access",
    title: "Operator certificates are re-checked for revocation",
    statement:
      "Every request re-checks the operator's certificate against the manager's denylist, the CA's CRL and, where set, its OCSP responder.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-manager", path: "internal/operatorca/crl.go", kind: "code" },
      { repo: "cryptos-manager", path: "internal/operatorca/ocsp.go", kind: "code" },
    ],
  },
  {
    id: "ACC-4",
    area: "access",
    title: "No self-approval",
    statement:
      "Certificate requests wait for an operator or admin, the requester can't approve their own, and both identities are audited.",
    status: "implemented",
    since: RC1,
    evidence: [
      {
        repo: "cryptos-manager",
        path: "internal/approval/approval.go",
        kind: "code",
        detail: "ErrSelfApproval",
      },
      { repo: "website", path: "apps/docs/docs/fleet-manager/approvals.md", kind: "doc" },
    ],
  },
  {
    id: "ACC-5",
    area: "access",
    title: "Agents go through the same checks",
    statement:
      "AI agents on the optional MCP endpoint get keys through an OAuth login that needs the operator's client certificate, and sensitive tools need a person's step-up approval.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-manager", path: "internal/mcpserver/stepup.go", kind: "code" },
      { repo: "cryptos-manager", path: "docs/mcp.md", kind: "doc" },
    ],
  },

  // Audit trail
  {
    id: "AUD-1",
    area: "audit",
    title: "Signed, hash-chained node audit log",
    statement:
      "Every node operation is appended to a SHA-256 hash chain, signed with a key kept apart from the CA key, on the encrypted partition.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/audit/doc.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/audit/audit_test.go",
        kind: "test",
        detail: "TestVerifyChain_DetectsSignatureTamper",
      },
      { repo: "website", path: "apps/docs/docs/deep-dives/audit-integrity.md", kind: "doc" },
    ],
  },
  {
    id: "AUD-2",
    area: "audit",
    title: "Operators can verify the log",
    statement: "cryptosctl lists the audit log and verifies its chain and signatures.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "cmd/cryptosctl/audit.go", kind: "code" },
      { repo: "website", path: "apps/docs/docs/using/audit-log.md", kind: "doc" },
    ],
  },
  {
    id: "AUD-3",
    area: "audit",
    title: "Hash-chained manager audit log",
    statement:
      "FleetOS Manager records every change with the acting operator, and the approval and approver where there is one, in a hash chain.",
    status: "implemented",
    since: RC1,
    evidence: [{ repo: "cryptos-manager", path: "internal/auditlog/auditlog.go", kind: "code" }],
  },
  {
    id: "AUD-4",
    area: "audit",
    title: "Audit retention with a signed checkpoint",
    statement:
      "The node log grows without a retention policy today. Trimming it behind a signed checkpoint isn't built.",
    status: "planned",
    evidence: [],
    gaps: [
      { repo: "cryptos-node", number: 327, title: "Audit retention with a signed checkpoint" },
    ],
  },
  {
    id: "AUD-5",
    area: "audit",
    title: "Audit export to a SIEM",
    statement:
      "Each node keeps its own signed, hash-chained log, which cryptosctl reads and verifies on the node. Shipping it to a SIEM isn't built.",
    status: "planned",
    evidence: [],
    gaps: [{ repo: "cryptos-node", number: 408, title: "Export the audit log to a SIEM" }],
  },

  // Appliance platform
  {
    id: "APP-1",
    area: "appliance",
    title: "Read-only root filesystem",
    statement:
      "The signed kernel image carries the Go PID 1 and a SquashFS root that is mounted read-only. Only the encrypted state partition is writable.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-appliance", path: "build/squashfs/build.sh", kind: "code" },
      { repo: "cryptos-appliance", path: "internal/switchroot/switchroot.go", kind: "code" },
    ],
  },
  {
    id: "APP-2",
    area: "appliance",
    title: "Secure Boot with your own key",
    statement:
      "Releases ship unsigned and the release pipeline checks they are. You sign the kernel image with your own Secure Boot key, so nothing in your chain of trust is signed by the project.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-appliance", path: "build/uki/sign.sh", kind: "code" },
      { repo: "cryptos-appliance", path: "build/release/check-unsigned.sh", kind: "ci" },
      { repo: "cryptos-appliance", path: "docs/secure-boot.md", kind: "doc" },
    ],
  },
  {
    id: "APP-3",
    area: "appliance",
    title: "Signed in-place upgrades with rollback",
    statement:
      "An upgrade image is checked against a detached signature before anything is written to the boot partition, and the previous image is kept for one rollback.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/imageupgrade/imageupgrade.go", kind: "code" },
      {
        repo: "cryptos-node",
        path: "internal/imageupgrade/imageupgrade_test.go",
        kind: "test",
        detail: "TestStage_RefusesASignatureOverOtherBytes",
      },
    ],
  },
  {
    id: "APP-4",
    area: "appliance",
    title: "Remote attestation",
    statement:
      "Measured boot gates the state disk (KEY-2). A node proves its identity by signing a challenge with its CA key; a TPM quote of its boot measurements isn't offered yet.",
    status: "partial",
    since: RC1,
    evidence: [{ repo: "cryptos-node", path: "internal/grpc/attest.go", kind: "code" }],
  },
  {
    id: "APP-5",
    area: "appliance",
    title: "A guarded clock",
    statement:
      "A time floor and NTP sync keep certificate validity and time-stamps from going backwards.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/timesync/floor.go", kind: "code" },
      { repo: "website", path: "apps/docs/docs/deep-dives/clock-safety.md", kind: "doc" },
    ],
  },
  {
    id: "APP-6",
    area: "appliance",
    title: "More platforms",
    statement:
      "Node images are amd64 for VMware today. Proxmox VE, bare-metal installs and an arm64 image are in progress.",
    status: "planned",
    evidence: [{ repo: "website", path: roadmap, kind: "doc" }],
    gaps: [
      { repo: "cryptos-appliance", number: 38, title: "Support Proxmox VE as a VM platform" },
      {
        repo: "cryptos-appliance",
        number: 54,
        title: "A plain installer ISO for bare-metal servers",
      },
      { repo: "cryptos-appliance", number: 117, title: "Build and prove an arm64 appliance image" },
    ],
  },

  // FleetOS Manager
  {
    id: "FLT-1",
    area: "fleet",
    title: "The manager holds no CA key",
    statement:
      "Certificates are issued and revoked on the node that holds the CA. The manager carries CSRs and signed certificates; the only certificates it makes are its own first-run TLS certificate and each node's admin credential.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-manager", path: "internal/fleet/certs.go", kind: "code" },
      { repo: "cryptos-manager", path: "internal/fleet/adopt_bootstrap.go", kind: "code" },
      { repo: "cryptos-manager", path: "cmd/manager/selfsigned.go", kind: "code" },
    ],
  },
  {
    id: "FLT-2",
    area: "fleet",
    title: "A node is pinned before it is trusted",
    statement:
      "Adoption pauses until an admin confirms the node's certificate fingerprint against its console. A link request pins the node's CA key from a signed challenge and waits as pending until an admin approves it.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-manager", path: "internal/fleet/enrollment.go", kind: "code" },
      { repo: "cryptos-manager", path: "internal/fleet/attest.go", kind: "code" },
      { repo: "cryptos-manager", path: "docs/node-trust.md", kind: "doc" },
    ],
  },
  {
    id: "FLT-3",
    area: "fleet",
    title: "Both sides verify every connection",
    statement:
      "The node accepts only the admin credential the manager made for it, and the manager accepts only the node certificate it recorded. A node it can't verify is refused.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-manager", path: "internal/nodeclient/servertrust.go", kind: "code" },
      { repo: "cryptos-manager", path: "docs/node-trust.md", kind: "doc" },
    ],
  },
  {
    id: "FLT-4",
    area: "fleet",
    title: "Pending-link until managed credentials exist",
    statement:
      "Marking an adopted node pending-link until its managed credentials are provisioned isn't built.",
    status: "planned",
    evidence: [],
    gaps: [
      {
        repo: "cryptos-manager",
        number: 54,
        title: "Mark adopted nodes pending-link until managed credentials are provisioned",
      },
    ],
  },
  {
    id: "FLT-5",
    area: "fleet",
    title: "A minimal, non-root manager image",
    statement:
      "The manager image is distroless, runs as a non-root user, and its base images are pinned by digest.",
    status: "implemented",
    since: RC1,
    evidence: [{ repo: "cryptos-manager", path: "Dockerfile", kind: "code" }],
  },

  // Availability and recovery
  {
    id: "REC-1",
    area: "availability",
    title: "CA key escrow for software keys",
    statement:
      "A software CA key can be exported and imported in a passphrase envelope (Argon2id and AES-256-GCM). A TPM key can't be exported, so it can't be escrowed.",
    status: "partial",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: "internal/backup/doc.go", kind: "code" },
      { repo: "cryptos-node", path: "internal/init/escrow.go", kind: "code" },
    ],
  },
  {
    id: "REC-2",
    area: "availability",
    title: "Two-node pairs with failover",
    statement:
      "Active and passive pairs with a shared address and lease-gated signing aren't built.",
    status: "planned",
    evidence: [
      { repo: "website", path: roadmap, kind: "doc", detail: "Phase 3: high-availability pairs" },
    ],
  },
  {
    id: "REC-3",
    area: "availability",
    title: "Split custody for Root recovery",
    statement:
      "Recovering a Root through split custody (for example Shamir shares or smart cards) isn't built.",
    status: "planned",
    evidence: [
      { repo: "website", path: roadmap, kind: "doc", detail: "Phase 3: disaster recovery" },
    ],
  },
  {
    id: "REC-4",
    area: "availability",
    title: "A changed boot chain means a rebuild",
    statement:
      "In TPM mode, if the PCR values drift outside an upgrade the state disk can't be unsealed and the node must be set up again. This is a stated limit, not a recovery path.",
    status: "partial",
    since: RC1,
    evidence: [{ repo: "cryptos-node", path: "internal/init/statekey.go", kind: "code" }],
  },
  {
    id: "REC-5",
    area: "availability",
    title: "Encrypted backup of node state",
    statement:
      "There is no backup of a node's etcd state today; only a software CA key can be escrowed (REC-1). An encrypted snapshot and restore isn't built.",
    status: "planned",
    evidence: [],
    gaps: [
      {
        repo: "cryptos-node",
        number: 407,
        title: "Encrypted backup and restore of a node's etcd state",
      },
    ],
  },

  // Supply chain and development
  {
    id: "SUP-1",
    area: "supply-chain",
    title: "Reproducible release images",
    statement:
      "The release pipeline builds the image twice and compares the outputs byte for byte. Releases carry SHA256SUMS and a build manifest.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-appliance", path: "build/release/reproducible.sh", kind: "ci" },
      { repo: "cryptos-appliance", path: "docs/release.md", kind: "doc" },
    ],
  },
  {
    id: "SUP-2",
    area: "supply-chain",
    title: "No project signature on releases",
    statement:
      "The project doesn't sign the images you boot. You verify the checksums and sign with your own key (APP-2).",
    status: "not-planned",
    reason:
      "A project key in your boot chain would make the project a party to your trust. You hold the keys, not us.",
    evidence: [{ repo: "cryptos-appliance", path: "docs/secure-boot.md", kind: "doc" }],
  },
  {
    id: "SUP-3",
    area: "supply-chain",
    title: "SBOM and build provenance",
    statement:
      "Release images carry no SBOM or provenance attestation; the image build sets them off.",
    status: "not-planned",
    reason:
      "Reproducible builds and published checksums are the check today; an SBOM isn't scheduled.",
    evidence: [
      { repo: "cryptos-manager", path: ".github/workflows/job-release-image.yaml", kind: "ci" },
    ],
  },
  {
    id: "SUP-4",
    area: "supply-chain",
    title: "Secret scanning",
    statement: "Gitleaks runs in CI on every code repository.",
    status: "implemented",
    since: RC1,
    evidence: [
      { repo: "cryptos-node", path: ".github/workflows/job-gitleaks.yaml", kind: "ci" },
      { repo: "cryptos-appliance", path: ".github/workflows/job-gitleaks.yaml", kind: "ci" },
    ],
  },
  {
    id: "SUP-5",
    area: "supply-chain",
    title: "Tests gate every change",
    statement:
      "Go code is formatted, linted, vetted and tested in CI, with a software TPM and interop tests, before it can merge.",
    status: "implemented",
    since: RC1,
    evidence: [{ repo: "cryptos-node", path: ".github/workflows/ci-go.yml", kind: "ci" }],
  },
  {
    id: "SUP-6",
    area: "supply-chain",
    title: "Pinned CI actions",
    statement:
      "Third-party GitHub Actions are pinned by commit SHA. A few org and tool references still float.",
    status: "partial",
    evidence: [{ repo: "cryptos-node", path: ".github/workflows/ci-go.yml", kind: "ci" }],
  },
  {
    id: "SUP-7",
    area: "supply-chain",
    title: "Standard library crypto on the certificate path",
    statement:
      "Key generation, signing and X.509 use only the Go standard library and golang.org/x/crypto. It is a written rule; no linter enforces it yet.",
    status: "partial",
    since: RC1,
    evidence: [{ repo: "cryptos-node", path: "internal/ca/doc.go", kind: "code" }],
  },
  {
    id: "SUP-8",
    area: "supply-chain",
    title: "Private vulnerability reporting",
    statement:
      "Vulnerabilities are reported privately through GitHub security advisories; the latest 0.x release gets fixes.",
    status: "implemented",
    evidence: [{ repo: ".github", path: "SECURITY.md", kind: "doc" }],
  },
  {
    id: "SUP-9",
    area: "supply-chain",
    title: "Vulnerability scanning in CI",
    statement:
      "CI scans for secrets and runs the linters and tests, but no workflow checks for known vulnerabilities with govulncheck or runs gosec yet.",
    status: "planned",
    evidence: [],
    gaps: [
      { repo: "cryptos-node", number: 406, title: "Run govulncheck and gosec in the Go repos' CI" },
    ],
  },
];
