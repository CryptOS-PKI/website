---
title: "🧩 QEMU guest agent"
---

# 🧩 QEMU guest agent

:::info[🚧 Ships in v0.1.0-rc.2]
This describes the guest agent as it ships in v0.1.0-rc.2, on the Proxmox platform image. Earlier images have no agent.
:::

Proxmox VE, and any other QEMU/KVM host, can talk to a guest agent inside the VM. With it, the host shows the node's IP addresses and OS on the VM's summary, and **Shutdown** and **Reboot** ask the node to stop instead of pressing a virtual power button.

CryptOS has no shell, so it doesn't run the usual `qemu-ga` program. The node's own init process answers the guest agent protocol, and it answers only a short list of questions and the power commands.

## What the agent does

| The host asks for | The node answers |
|---|---|
| Ping and agent info | that the agent is running, and which commands it answers |
| OS info | `CryptOS`, the CryptOS version, and the kernel release |
| Host name, time and time zone | the node's host name, its clock, and its zone (UTC) |
| Network interfaces | each interface with its MAC address and IP addresses |
| Shutdown (power off or halt) | an orderly shutdown, then the VM powers off |
| Shutdown (reboot) | an orderly shutdown, then the node restarts |
| Filesystem freeze status | always `thawed` |

An orderly shutdown is the same one `cryptosctl reboot` runs: the node stops its listeners, closes the audit log and its database, and locks the state disk before it powers off or restarts. It works in maintenance mode too, when the node is booted from the ISO.

## What the agent doesn't do

The agent refuses everything else, and the host gets the same "command not found" error it would get from a locked-down `qemu-ga`. That includes:

- running programs (`guest-exec`);
- reading or writing files (`guest-file-*`);
- setting passwords or SSH keys (`guest-set-user-password`, `guest-ssh-*`);
- freezing filesystems for a backup (`guest-fsfreeze-freeze`).

There is no way to reach a shell, a file or a key through it.

## Before you start

:::caution[Before you start]
You need a node running the v0.1.0-rc.2 Proxmox image, and access to its VM in the Proxmox web UI or a shell on the Proxmox host. Turning the agent on only takes effect after Proxmox stops and starts the VM, so plan for the node to be offline for one restart.
:::

## 1. Turn the agent on

In the Proxmox web UI, open the VM, then **Options** > **QEMU Guest Agent** > **Edit**:

1. Tick **Use QEMU Guest Agent**.
2. Untick **Freeze/thaw guest filesystems on backup for consistency**.
3. Click **OK**.

Or run this on the Proxmox host, with your VM's ID:

```bash title="On the Proxmox host"
qm set <vmid> --agent enabled=1,freeze-fs-on-backup=0
```

`freeze-fs-on-backup` is the option name Proxmox VE 8 uses. Newer releases call it `freeze-fs` and still accept the old name.

:::caution[Turn the filesystem freeze off]
The node refuses filesystem freeze. If you leave the freeze on, every snapshot-mode backup logs two `ERROR:` lines ("unable to freeze guest fs" and the matching thaw). The backup still finishes, crash-consistent, the same as a backup of a VM with no agent. Turning the freeze off skips the attempt and keeps the backup log clean.
:::

## 2. Restart the VM from Proxmox

:::warning[This takes the node offline]
The node stops serving until it has booted again. On an Issuing CA, enrollment stops for that time.
:::

Proxmox adds the agent's channel to the VM only when it starts the VM, so restart it from Proxmox: click **Reboot**, or **Shutdown** and then **Start**. A restart from inside the node, such as `cryptosctl reboot`, keeps the same virtual hardware and doesn't add the channel.

## 3. Check that the agent answers

```bash title="On the Proxmox host"
qm guest cmd <vmid> ping
qm guest cmd <vmid> get-osinfo
qm guest cmd <vmid> network-get-interfaces
```

`ping` exits 0 when the agent answers; if it isn't running, `qm` says so. `get-osinfo` shows `"name": "CryptOS"` and the CryptOS version. The VM's **Summary** page now shows the node's IP addresses.

:::tip[If the agent doesn't answer]
Check that the node runs the Proxmox image of v0.1.0-rc.2 or later, and that Proxmox started the VM after you turned the option on. Without an agent, **Shutdown** still works: Proxmox falls back to the virtual power button, and the node shuts down in order.
:::
