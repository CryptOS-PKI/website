---
title: "🖥️ Create a Proxmox VE VM"
---

# 🖥️ Create a Proxmox VE VM

Make the virtual machine a CryptOS node boots on in Proxmox VE, from the installer ISO. This page is the VM and nothing else: it ends with the node waiting in [maintenance mode](./boot-maintenance.md), ready for its config.

The Proxmox ISO is new in `v0.1.0-rc.2`. These steps were run on Proxmox VE 9.2.

:::info[Before you start]
- A Proxmox VE host with a storage that holds ISO files, a storage for VM disks, and a bridge to the network the node will use.
- The `cryptos-amd64-proxmox-unsigned-<build>.iso` file and `SHA256SUMS` from the release on GitHub. The release ships no signed image: it signs nothing.
- The decision on Secure Boot, below. This page leaves it off.
:::

## 1. Get the ISO and check it

On the Proxmox host, in the ISO folder of your ISO storage (`/var/lib/vz/template/iso` for the default `local` storage), download both files from the release and check the sum:

```bash
cd /var/lib/vz/template/iso
wget https://github.com/CryptOS-PKI/cryptos-appliance/releases/download/<tag>/cryptos-amd64-proxmox-unsigned-<build>.iso
wget https://github.com/CryptOS-PKI/cryptos-appliance/releases/download/<tag>/SHA256SUMS
grep ' cryptos-amd64-proxmox-unsigned-<build>.iso$' SHA256SUMS | sha256sum -c
```

:::tip[Expected output]
```text
cryptos-amd64-proxmox-unsigned-<build>.iso: OK
```
:::

:::caution[Nothing else vouches for the file]
The project signs nothing, so this check against the release's `SHA256SUMS` is the only one. If it says `FAILED`, delete the file and download it again.
:::

## 2. Create the VM

On the host, create the VM. This example is VM 200 on the storages `local-lvm` (disks) and `local` (the ISO) and the bridge `vmbr0`; change those, the ID and the name to fit your host:

```bash
qm create 200 --name cryptos-root --machine q35 --bios ovmf --cores 2 --cpu host --memory 2048 \
  --ostype l26 --scsihw virtio-scsi-pci --scsi0 local-lvm:20 \
  --efidisk0 local-lvm:1,efitype=4m,pre-enrolled-keys=0 \
  --tpmstate0 local-lvm:1,version=v2.0 \
  --net0 virtio,bridge=vmbr0 \
  --ide2 local:iso/cryptos-amd64-proxmox-unsigned-<build>.iso,media=cdrom \
  --boot 'order=scsi0;ide2' --agent enabled=1 --vga std --onboot 0
```

What each part is for:

| Setting | Why |
|---|---|
| `--machine q35 --bios ovmf` | The ISO boots only through UEFI. |
| `--efidisk0 ...pre-enrolled-keys=0` | A firmware variable store with no keys enrolled, so Secure Boot is off. The release image is unsigned. |
| `--tpmstate0 ...version=v2.0` | A virtual TPM 2.0. The Proxmox image seals its disk to the TPM and has no other mode, so the VM needs one. |
| `--scsihw virtio-scsi-pci --scsi0 ...:20` | One VirtIO SCSI disk. The node installs to the whole disk and sees it as `/dev/sda`; this one was 20 GiB. |
| `--net0 virtio,bridge=vmbr0` | A VirtIO network card on the bridge the node will use. |
| `--ide2 ...,media=cdrom` | The installer ISO, as the virtual CD-ROM. |
| `--boot 'order=scsi0;ide2'` | Disk first, CD second. The blank disk isn't bootable, so the first boot falls through to the ISO; after the install the node boots from its disk. |
| `--agent enabled=1` | Turns on the QEMU guest agent channel. See below. |
| `--cores 2 --cpu host --memory 2048` | Two virtual CPUs, the host's CPU type and 2 GiB. The project's own tests run a node with 2 GiB and the host CPU type; these steps ran it with two virtual CPUs. |

:::danger[Decide on Secure Boot before the first boot]
On a TPM node, changing Secure Boot afterwards locks the node out of its own disk. This page leaves it off, which is what the unsigned image needs. Don't turn it on later without reinstalling. This release has no documented enrolment procedure for Proxmox, so for v0.1.0 run the unsigned image with Secure Boot off.
:::

:::warning[The install erases the whole disk]
The node installs onto the disk named in `install.disk` and erases it. In this VM that is the one VirtIO SCSI disk you just created, `/dev/sda`. Check the name in the machine config before you send it.
:::

## 3. Start it and find its address

```bash
qm start 200
```

A maintenance node takes its address from DHCP. The console shows it, or you can ask the guest agent about 15 seconds after the start:

```bash
qm guest cmd 200 network-get-interfaces
```

:::tip[Expected output]
The interface list. The node's address is the IPv4 address on `eth0`:

```text
{ "hardware-address" : "bc:24:11:00:00:01", "ip-addresses" : [ { "ip-address" : "192.0.2.50", "ip-address-type" : "ipv4", "prefix" : 24 }, ... ], "name" : "eth0" }
```
:::

With the address, check the node's certificate fingerprint against the one on the VM's console, as in [Check the node's certificate](./boot-maintenance.md#check-the-nodes-certificate), before you send it anything.

## The QEMU guest agent

CryptOS has no shell and no side services, so it can't run the stock `qemu-ga`: its exec, file and password commands would be a remote shell. Instead the node's init answers the agent protocol itself, on the VirtIO serial port Proxmox adds when the agent is on, and it answers a short list of read-only and power commands.

| It answers | What for |
|---|---|
| `guest-ping`, `guest-sync`, `guest-sync-delimited` | Proxmox checks the agent is there. |
| `guest-info`, `guest-get-osinfo` | The agent's version and the node's name and version. |
| `guest-get-host-name`, `guest-get-time`, `guest-get-timezone` | Name and clock. |
| `guest-network-get-interfaces` | The addresses, as above. |
| `guest-shutdown` | Shutdown and reboot go through the node's orderly shutdown path. |
| `guest-fsfreeze-status` | Always reports `thawed`. |

Everything else is refused with the same answer qemu-ga gives for a command it doesn't have, including `guest-exec`, `guest-file-*`, `guest-set-user-password`, `guest-ssh-*` and `guest-fsfreeze-freeze`.

```bash
qm guest cmd 200 get-osinfo
```

:::tip[Expected output]
```text
{
   "id" : "cryptos",
   "name" : "CryptOS",
   "pretty-name" : "CryptOS v0.1.0-rc.2",
   "version" : "v0.1.0-rc.2",
   ...
}
```
:::

## 4. Send the config

The node is waiting for its machine config. Follow [Bootstrap and apply config](./bootstrap-apply.md), with these two things for this VM:

- `install.disk` is `/dev/sda`.
- Put the whole admin certificate in `bootstrap.admin_cert_pem`.

:::danger[Don't name the admin by fingerprint]
Name the admin with the whole certificate in `bootstrap.admin_cert_pem`. A node needs it to serve its management API. From `v0.1.0-rc.3` a maintenance node refuses a config with only `bootstrap.admin_cert_sha256` before it touches the disk, and stays in maintenance mode. On `v0.1.0-rc.2` that config is accepted and installs, and then the node boot-loops on its first boot and never opens port 443.
:::

Set `network.ntp_servers` too. Without it the node takes time servers from its DHCP lease, or runs on the VM's clock, and `cryptosctl config apply` warns about it.

After the install the node reboots and comes up on the static address in your config. Continue with [Reboot into the ceremony](./reboot-ceremony.md). The ISO can stay attached, because the disk is first in the boot order. To detach it, remove the CD-ROM drive from the VM's hardware list.
