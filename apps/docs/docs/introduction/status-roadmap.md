---
title: "🗺️ Project status and roadmap"
---

import Pre10Notice from '@site/docs/_partials/pre-1-0-notice.mdx';

# 🗺️ Project status and roadmap

CryptOS is pre-1.0, and its first release candidates are just starting to come out. Here is an honest picture of what is finished and what is still coming.

<Pre10Notice />

## ✅ Works today

The core of a certificate authority is built, tested, and running on VMware virtual machines:

- Making the signing key **inside the TPM**, and never letting it out in the clear.
- Self-signing a **Root certificate** that follows the certificate standard (RFC 5280) to the letter.
- The **first-boot ceremony** that creates that Root, step by step.
- The **machine config** file that describes a node.
- The encrypted **API** (mTLS gRPC) and the tamper-evident **audit log**.
- The full **`cryptosctl`** command-line tool.
- Signing subordinate CAs and issuing end-entity certificates from a CSR, and enrolling devices over **SCEP** (RFC 8894). See [Enrol devices with SCEP](../using/enrol-devices-scep.md).
- Building the OS image and turning it into a bootable **ISO** for a platform such as VMware.
- Installing a node from start to finish: **maintenance mode** on the very first boot, **install to disk**, then the reboot into the ceremony. See [Install & Deploy](../install-deploy/build-bootable-image.md).
- The **Fleet Manager** web app, for watching and managing several nodes from one place. See [Fleet Manager overview](../fleet-manager/overview.md).

## 📦 What each release ships

Not every target arrived in the first release candidate. This table says what is published, from which release, and for which architectures:

| Target | Available from | Architectures | Status |
|---|---|---|---|
| VMware installer ISO (TPM-backed and `nodeid` variants, with their UKIs) | `v0.1.0-rc.1` | amd64 | Released. You install the ISO into a VMware virtual machine; there is no OVA. |
| Proxmox ISO (q35 machine, OVMF firmware, vTPM) | `v0.1.0-rc.2` | amd64 | New in `rc.2`. Being tested on a real Proxmox VE host before `rc.2` ships. |
| FleetOS Manager image (`ghcr.io/cryptos-pki/cryptos-manager`) | `v0.1.0-rc.1` | `linux/amd64` in `rc.1`; `linux/amd64` and `linux/arm64` from `rc.2` | Released. |
| `cryptosctl` | `v0.1.0-rc.1` | Linux and macOS on amd64 and arm64; Windows from `rc.2` | Released. |
| `cryptos-managerctl` | `v0.1.0-rc.2` | Linux, macOS and Windows on amd64 and arm64 | Ships first in `rc.2`. |

Both VMware and Proxmox VE are in `v0.1.0`. Node images are amd64 only in every release so far: the build takes an architecture, but no arm64 node image has been built or booted (see [Platform profiles and the image factory](../concepts/image-factory.md)). arm64 appliance images are planned for a later release ([cryptos-appliance#117](https://github.com/CryptOS-PKI/cryptos-appliance/issues/117)). Physical servers and installing from a USB stick aren't in `v0.1.0`.

## 🧭 Roadmap

- **Still landing** — the Fleet Manager's web UI for adding operators and making credential requests is in flight; a few of its pages are still being finished.
- **More enrolment protocols** — ACME and EST, alongside the SCEP support that already works.
- **Physical servers** — installing on a physical server, including booting the installer from a USB stick. The code is in, but it hasn't been proven on real hardware, so it isn't supported in v0.1.0.
- **Phase 3** — high-availability pairs, many independent Roots, signed add-on extensions, and disaster recovery.

:::info[Release candidates: 0.x]
Every CryptOS release before `1.0.0` is a `0.x` release: `v0.1.0` is the first, and each one is preceded by release candidates (`v0.1.0-rc.1`, `rc.2` and so on) that are tested the same way. `1.0.0` will be the first GA release, once the whole system lands. It isn't out yet.
:::

## One thing to know today

A node does more than sign its own Root: it can sign subordinate CAs and issue end-entity certificates from a CSR. The `ca` commands in the [cryptosctl command reference](../reference/cryptosctl.md#certificate-authority) list what it can sign today.
