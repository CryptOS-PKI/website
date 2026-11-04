---
title: "🖥️ cryptos-managerctl command reference"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🖥️ cryptos-managerctl command reference

`cryptos-managerctl` scripts a FleetOS Manager from a workstation, the way [`cryptosctl`](/docs/cryptos/vnext/reference/cryptosctl) scripts a node. It covers the everyday work of the web console: nodes and their status, issuing and revoking certificates, and approvals.

It signs in with your operator certificate, the same one the web console uses, and your access level applies the same way.

## Install

:::info[New in v0.1.0-rc.2]
`cryptos-managerctl` ships first with `v0.1.0-rc.2`. `v0.1.0-rc.1` has no `cryptos-managerctl` binaries.
:::

Each release of [`cryptos-manager`](https://github.com/CryptOS-PKI/cryptos-manager/releases) attaches a binary for Linux, macOS and Windows, on amd64 and arm64, and a `SHA256SUMS` file.

<Tabs groupId="os" queryString>
<TabItem value="unix" label="Linux / macOS" default>

Download the binary for your platform, check it against `SHA256SUMS`, and put it on your path. This example is Linux on amd64:

```bash
sha256sum --ignore-missing -c SHA256SUMS
chmod +x cryptos-managerctl-linux-amd64
sudo mv cryptos-managerctl-linux-amd64 /usr/local/bin/cryptos-managerctl
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

Download `cryptos-managerctl-windows-amd64.exe`, compare its hash with the line in `SHA256SUMS`, and rename it:

```powershell
Get-FileHash .\cryptos-managerctl-windows-amd64.exe -Algorithm SHA256
Rename-Item .\cryptos-managerctl-windows-amd64.exe cryptos-managerctl.exe
```

</TabItem>
</Tabs>

## Connecting to the manager

Every command except `version` needs the manager's address and your certificate. Set them with flags, or once in the environment.

| Flag | Environment variable | What it is |
|---|---|---|
| `--server` | `CRYPTOS_MANAGER_SERVER` | The manager's `https` URL. |
| `--cert` | `CRYPTOS_MANAGER_CERT` | Your operator certificate, PEM. |
| `--key` | `CRYPTOS_MANAGER_KEY` | Your operator private key, PEM. |
| `--ca` | `CRYPTOS_MANAGER_CA` | The CA bundle to verify the manager against. Empty uses the system roots. |

<Tabs groupId="os" queryString>
<TabItem value="unix" label="Linux / macOS" default>

```bash
export CRYPTOS_MANAGER_SERVER=https://fleetos.example.org
export CRYPTOS_MANAGER_CERT=operator.crt
export CRYPTOS_MANAGER_KEY=operator.key
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
$env:CRYPTOS_MANAGER_SERVER = "https://fleetos.example.org"
$env:CRYPTOS_MANAGER_CERT = "operator.crt"
$env:CRYPTOS_MANAGER_KEY = "operator.key"
```

</TabItem>
</Tabs>

:::caution[The manager's certificate is always checked]
There's no flag to skip the check. If the manager serves a certificate your system doesn't trust, pass its CA with `--ca`.
:::

## Other global flags

| Flag | Default | What it does |
|---|---|---|
| `-o`, `--output` | `table` | `table`, `json` or `yaml`. |
| `--timeout` | `1m0s` | How long a command may take. |

Set `LOG_LEVEL=debug` to log each API call to standard error. Standard output stays clean for scripts.

## Commands

### whoami

Shows who your certificate signs you in as, and your level.

```bash
cryptos-managerctl whoami
```

### nodes

| Command | What it does |
|---|---|
| `nodes list` | Lists nodes with their role, health and address, and whether a reboot is needed. |
| `nodes get NODE` | Shows one node, by name or ID. |

### certs

| Command | Flags | What it does |
|---|---|---|
| `certs list` | `--node` | Lists issued certificates, across the fleet or for one node. |
| `certs get` | `--node`, `--serial` | Prints a certificate and its chain as PEM. `--node` is the name here. |
| `certs issue` | `--node`, `--profile`, `--csr` | Issues a certificate from a CSR, PEM or DER, and prints it as PEM. |
| `certs revoke` | `--node`, `--serial`, `--reason`, `--yes` | Revokes a certificate on the node that issued it. |

`certs issue` sends only the CSR, so the private key stays on your machine.

```bash
cryptos-managerctl certs issue --node issuing-1 --profile web-server --csr www.csr > www.crt
```

:::danger[Revocation can't be undone]
`certs revoke` refuses to run without `--yes`. Check the serial and the node first: a revoked certificate stays revoked. `--reason` is an RFC 5280 reason code, and the default is 0, unspecified.
:::

```bash
cryptos-managerctl certs revoke --node issuing-1 --serial 0a0b --reason 1 --yes
```

### profiles

| Command | What it does |
|---|---|
| `profiles list` | Lists the certificate profiles in the catalog. |

### enrollments

| Command | Flags | What it does |
|---|---|---|
| `enrollments list` | | Lists enrollment requests. |
| `enrollments approve ID` | `--endpoint`, `--admin-cert`, `--admin-key`, `--node-ca` | Approves a request. |
| `enrollments reject ID` | `--reason` | Rejects a request. |

A `LINK` request needs the node's endpoint and the admin credential the manager will use on it. A `SUBORDINATE` request needs none of them.

:::warning[Check the attestation before you approve]
Approving lets a node into the fleet. Read the request's attestation and pinned key first: `enrollments list -o yaml` shows them.
:::

### approvals

| Command | Flags | What it does |
|---|---|---|
| `approvals list` | `--status` | Lists approvals, or only those with a status such as `pending`. |
| `approvals approve ID` | | Approves a request. |
| `approvals deny ID` | | Denies a request. |

### version

Prints the CLI's version and commit. It doesn't contact a manager.
