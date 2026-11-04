---
title: "📤 Bootstrap and apply config"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📤 Bootstrap and apply config

:::tip[✅ Works today]
This describes CryptOS as it works right now.
:::

A maintenance node is waiting for one thing: its **machine config**. That single YAML file says what the node is (its role, name and network address), which administrator it trusts, and which disk to install to. You make an administrator identity on your workstation, put it in the config, and send the config to the node.

## 1. Get `cryptosctl`

`cryptosctl` is the command-line tool you manage every node with. It runs on Linux and macOS on amd64 and arm64, and on Windows from `v0.1.0-rc.2`. Download it from a `cryptos-appliance` GitHub Release, where each file carries the build tag (`cryptosctl-linux-amd64-<build tag>`, `cryptosctl-darwin-arm64-<build tag>`, `cryptosctl-windows-amd64-<build tag>.exe` from `v0.1.0-rc.2`, and so on), and check it against `SHA256SUMS`. On Linux or macOS you can also build it from the `cryptos-node` source.

<Tabs groupId="os" queryString>
<TabItem value="unix" label="Linux / macOS" default>

```bash
task build        # writes bin/cryptosctl (plus bin/init and bin/cryptos-install)
bin/cryptosctl version
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

:::info[Windows builds start in v0.1.0-rc.2]
`v0.1.0-rc.1` has no Windows `cryptosctl`. Use `v0.1.0-rc.2` or later, or run `cryptosctl` from a Linux or macOS machine.
:::

:::caution[Check the sum before you run it]
The project signs nothing, so Windows can warn about an unknown publisher. The check below is what tells you the file is the one published. If it reports a mismatch, delete the file and download it again.
:::

From the folder that holds the download and `SHA256SUMS`, set the file name and compare the sums:

```powershell
$exe = "cryptosctl-windows-amd64-<build tag>.exe"
$want = ((Select-String -Path .\SHA256SUMS -SimpleMatch $exe).Line -split '\s+')[0]
$got = (Get-FileHash -Algorithm SHA256 $exe).Hash.ToLower()
if ($got -eq $want) { "OK" } else { throw "checksum mismatch" }
```

Copy it to a folder of its own and add that folder to your `Path`:

```powershell
$dir = "$env:LOCALAPPDATA\Programs\cryptosctl"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Copy-Item $exe "$dir\cryptosctl.exe"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$userPath;$dir", "User")
```

Open a new terminal so it picks up the change, then check it runs:

```powershell
cryptosctl version
```

</TabItem>
</Tabs>

## 2. Make your bootstrap admin identity

The node needs to know who is allowed to manage it once it is installed. `cryptosctl bootstrap` makes that identity on **your workstation**: an ECDSA P-256 key and a self-signed client certificate.

```bash
cryptosctl bootstrap --common-name "Example Org bootstrap admin"
```

:::tip[Expected output]
The key and certificate are written, and the SHA-256 is the value for the machine config.

```text
wrote /home/you/.cryptos/identity.crt
wrote /home/you/.cryptos/identity.key
SHA-256: 8748ee3c8a8a55e3c89fee5f71b70ddd99fcb6e8865d17271469d4221b7cecd0

Stamp into machine config under bootstrap.admin_cert_pem (or admin_cert_sha256):
-----BEGIN CERTIFICATE-----
...
```
:::

The files go to `~/.cryptos/` (`%USERPROFILE%\.cryptos` on Windows) unless you pass `--out-dir`, and that is where `cryptosctl` looks for them by default. The certificate is valid for one year unless you set `--validity`. The private key never leaves your workstation: the node only ever learns the certificate or its fingerprint.

:::danger[identity.key is the key to the node]
After the install, whoever holds `identity.key` administers the node. Keep it safe, and never copy it to the node or share it.
:::

:::caution[On Windows the key takes its folder's permissions]
On Linux and macOS `cryptosctl` writes `identity.key` readable only by you. Windows does not apply that mode: the file inherits the permissions of its folder. Your profile folder is private by default, so keep the default location, or pass `--out-dir` only for a folder that nobody else can read. To see who can read the key, run `icacls "$env:USERPROFILE\.cryptos\identity.key"`.
:::

## 3. Write the machine config

Here is a complete config for a Root CA node:

```yaml
apiVersion: cryptos.dev/v1alpha1
kind: MachineConfig
metadata:
  name: pki-root-1
role:
  kind: root
network:
  interface: eth0
  address: 192.0.2.10/24
  gateway: 192.0.2.1
  nameservers:
    - 192.0.2.53
bootstrap:
  admin_cert_sha256: 8748ee3c8a8a55e3c89fee5f71b70ddd99fcb6e8865d17271469d4221b7cecd0
pki:
  root_key_alg: ECDSA-P384
  root_subject:
    common_name: Example Root CA G1
    organization: Example Org
    country: US
  root_validity_years: 20
install:
  disk: /dev/sda
```

What each part does:

| Field | Meaning |
|---|---|
| `apiVersion`, `kind` | Always `cryptos.dev/v1alpha1` and `MachineConfig`. Any other value is refused. |
| `metadata.name` | The node's hostname. |
| `role.kind` | `root`, `intermediate` or `issuing`. |
| `network.interface` | The network card the node configures after the install, by its kernel name (usually `eth0`). |
| `network.address`, `network.gateway` | The node's **static** address in CIDR form and its gateway. After the install the node listens here, on port 443. |
| `network.nameservers` | Optional DNS servers, as IPv4 addresses. Without them the node uses the ones DHCP handed out during boot. |
| `bootstrap.admin_cert_sha256` | The SHA-256 that `cryptosctl bootstrap` printed. Or use `bootstrap.admin_cert_pem` with the whole certificate. Set exactly one of the two. |
| `pki.root_key_alg` | The CA key type: `ECDSA-P384`, `RSA-3072` or `RSA-4096`. |
| `pki.root_subject` | The CA certificate's name. `common_name` is required; `organization`, `country`, `province` and `locality` are optional. |
| `pki.root_validity_years` | How long the Root certificate lasts, from 1 to 30 years. Needed for a Root only. |
| `install.disk` | The whole disk to install to, such as `/dev/sda` or `/dev/nvme0n1`. **It is erased.** Needed for an install from maintenance mode. |

`cryptosctl` checks the file before it sends anything, so a typo such as a short fingerprint fails on your workstation:

:::tip[Expected output]
For a fingerprint only three characters long, nothing is sent and the error names the field:

```text
cryptosctl: config: bootstrap.admin_cert_sha256: must be 64 hex characters, got 3
```
:::

Unknown field names are refused too, so a misspelled key is caught rather than ignored. The full list of fields, including certificate profiles, revocation and the subordinate roles, is in the [machine config reference](../reference/machine-config.md).

:::note[The address changes at install]
During maintenance the node uses its DHCP address. After the install it uses `network.address` from this file. Pick an address you can reach from your workstation.
:::

## 4. Send the config

Point `cryptosctl` at the maintenance node's DHCP address:

:::danger[This erases the install disk]
A maintenance node that accepts the config wipes the whole disk named in `install.disk` and installs itself on it. Check that `install.disk` names the right disk before you send it.
:::

```bash
cryptosctl --insecure --endpoint 192.0.2.50:443 config apply -f root.yaml
```

:::tip[Expected output]
The install has finished and the node is rebooting.

```text
applied: generation=0 requires_reboot=true digest=
```
:::

The command returns once the install has finished. `requires_reboot=true` means the disk is written and the node is rebooting. The generation and digest are empty here because a maintenance node has nowhere to store config yet; they are filled in on a node that is already installed. If the config fails the node's own checks, nothing is written to the disk: fix the file and send it again.

## Next step

See what the node does with it: [Install to disk](./install-to-disk.md).
