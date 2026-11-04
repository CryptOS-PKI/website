---
title: "💾 Install to disk"
---

# 💾 Install to disk

When a maintenance node accepts your machine config, it installs itself onto the disk named in `install.disk` and reboots. You do not run anything else. This page explains what it writes, so you know what to expect and what the disk looks like afterwards.

:::info[v0.1.0 installs on virtual machines only]
v0.1.0 supports installing on a VMware or Proxmox VE virtual machine, from the amd64 installer ISO. The Proxmox ISO is new in `v0.1.0-rc.2`; `v0.1.0-rc.1` has the VMware installer ISO only. Physical servers and booting from a USB stick aren't supported in v0.1.0; they're planned for a later release.
:::

## What the node does

1. **Checks the config.** It parses and validates it again on the node, and refuses it if `install.disk` is missing.
2. **Finds its own image.** It locates the UKI it booted from: on a partition named `EFI`, or on the virtual CD-ROM drive the hypervisor presents. It skips the disk in `install.disk` and its partitions, so it never takes the image from the disk it is about to erase.
3. **Erases and partitions the disk.** It wipes the disk and writes a new GPT partition table with two partitions.
4. **Writes the boot partition.** It formats the first partition as FAT32 and copies the UKI to `EFI/BOOT/BOOTX64.EFI`, the path UEFI firmware boots by default. No firmware boot entry is needed.
5. **Stages your config.** It writes the machine config to `EFI/cryptos/machine.yaml` on that boot partition, where the node picks it up on its next boot.
6. **Reboots.** It answers `cryptosctl` first, then restarts.

## The disk layout

| # | GPT name | Size | Contents |
|---|---|---|---|
| 1 | `EFI` | 512 MiB | FAT32 EFI System Partition: the UKI and the staged config |
| 2 | `cryptos-state` | the rest of the disk | left empty; encrypted on the first boot |

The node finds its state partition by the GPT name `cryptos-state`, so that name matters. It is also how the node tells an installed machine from a new one: with the partition present it boots normally, without it it goes into maintenance mode.

The state partition is **not** formatted during the install. On the first boot from disk the node turns it into an encrypted LUKS2 volume, seals the volume key (to the TPM, or from the machine UUID on a `nodeid` image), and only then creates a filesystem inside it. Private keys are never written to the disk in the clear.

## Detach the ISO

After the reboot the machine should start from the disk. Remove the ISO from the virtual CD drive, or put the disk first in the boot order, so the firmware boots the copy on disk.

## Installing without maintenance mode

:::info[Not supported in v0.1.0]
`cryptos-node` also builds `cryptos-install`, a tool that writes the same disk layout from a Linux live system on a physical server. Physical servers aren't supported in v0.1.0, so neither is this tool. Install through maintenance mode, as above.
:::

## Next step

[Reboot into the ceremony](./reboot-ceremony.md).
