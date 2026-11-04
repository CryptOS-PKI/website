---
title: "🖥️ Install on Proxmox VE"
---

import Pre10Notice from '@site/docs/_partials/pre-1-0-notice.mdx';

# 🖥️ Install on Proxmox VE

:::info[In flight]
The `proxmox` image installs and upgrades in QEMU with OVMF and swtpm, which is what Proxmox runs underneath, on Proxmox's default virtual hardware. It has not been run on a real Proxmox host yet.
:::

<Pre10Notice />

This page sets up a Proxmox VE virtual machine for a CryptOS node. From there the install is the same as on any other machine. The install medium is the ISO, which goes straight into Proxmox's ISO storage with no conversion.

## Before you start

- A signed `proxmox` ISO. Sign the `cryptos-amd64-proxmox-unsigned-<build>.iso` release file with your own key, or build one with `task iso PLATFORM=proxmox` ([Build a bootable image](./build-bootable-image.md)).
- Your Secure Boot certificate, if Secure Boot will be on ([Secure Boot enrollment](./secure-boot.md)).
- A trusted, isolated network for the VM ([Boot and maintenance mode](./boot-maintenance.md)).

## Create the VM

1. Upload the ISO to a storage that holds ISO images.
2. Choose **Create VM**. On **OS**, pick the ISO, and set the guest type to **Linux**.
3. On **System**, set these:

   | Setting | Value |
   |---|---|
   | Machine | `q35` |
   | BIOS | `OVMF (UEFI)` |
   | Add EFI Disk | on |
   | Add TPM | on, version `v2.0` |
   | SCSI Controller | `VirtIO SCSI single` |
   | QEMU Agent | off |

4. On **Disks**, add one disk of at least 8 GiB on the **SCSI** bus. The node sees it as `/dev/sda`.
5. On **CPU** and **Memory**, give the VM at least 2 cores and 2 GiB. Turn **Ballooning Device** off.
6. On **Network**, use the **VirtIO (paravirtualized)** model.
7. Finish, but don't start the VM yet.

:::caution[Leave QEMU Agent off]
The image has no guest agent yet. With the option on, Proxmox waits for an agent that never answers, and **Shutdown** times out. With it off, **Shutdown** sends an ACPI power button press, and the node shuts down in order.
:::

:::danger[The TPM State and EFI disks are part of the node's identity]
The state key is sealed in the VM's virtual TPM, and the firmware's Secure Boot keys are on its EFI disk. If you delete or recreate either one, the node can't unlock its disk. A backup or migration of the VM has to include both.
:::

## Install the node

1. If Secure Boot will be on, enroll your certificate now ([Secure Boot enrollment](./secure-boot.md#proxmox-ve)). If it stays off, open the VM's firmware setup and untick **Attempt Secure Boot**: the EFI disk turns Secure Boot on by default, and it refuses an unsigned image.
2. Start the VM. It boots the ISO into maintenance mode.
3. Follow [Boot and maintenance mode](./boot-maintenance.md), then [Install to disk](./install-to-disk.md), with `install.disk` set to `/dev/sda`.
4. After the node reboots from the disk, detach the ISO.

## Next step

Finish the node with [Reboot into the ceremony](./reboot-ceremony.md).
