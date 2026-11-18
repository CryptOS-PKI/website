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
// The current release's downloads, for the Releases page, in one place: a
// new release is a change to this file and to the version in
// packages/frame/release.ts. Sizes are the GitHub Release API's byte counts
// at the time this was written; the page's "How to verify" step checks the
// files against SHA256SUMS rather than trusting this file.
import { release as current } from "@cryptos-pki/frame/release";

import { links } from "./cryptos.ts";

const RELEASES = "https://github.com/CryptOS-PKI/cryptos-appliance/releases";

// The appliance's file names carry the build tag (the release plus the
// commit it was built from).
const BUILD = "v0.1.0-rc.2-0-gc5b194d";

export const release = {
  ...current,
  pageHref: `${RELEASES}/tag/${current.version}`,
};

// FleetOS Manager ships as a container image and a Helm chart on GHCR, from
// cryptos-manager's tag of the same name.
export const kubernetes = {
  chart: "oci://ghcr.io/cryptos-pki/charts/fleet-manager",
  chartVersion: release.version.slice(1),
  image: `ghcr.io/cryptos-pki/cryptos-manager:${release.version}`,
  guideHref: `${links.docs}/docs/fleet/helm`,
};

// Every way to run this release, and where each one stands. Only an
// available target links a guide.
export interface InstallTarget {
  id: "iso-tpm" | "iso-nodeid" | "cli" | "manager" | "proxmox" | "bare-metal";
  label: string;
  status: "Available" | "Not yet available";
  arch: string;
  guideLabel?: string;
  guideHref?: string;
}

export const installTargets: InstallTarget[] = [
  {
    id: "iso-tpm",
    label: "Installer ISO, for a VMware ESXi VM with a vTPM",
    status: "Available",
    arch: "amd64 only",
    guideLabel: "Download and sign the image",
    guideHref: `${links.docs}/docs/cryptos/install-deploy/build-bootable-image#download-the-unsigned-image`,
  },
  {
    id: "iso-nodeid",
    label: "Installer ISO, nodeid variant, for a VM with no TPM",
    status: "Available",
    arch: "amd64 only",
    guideLabel: "Where the CA key lives",
    guideHref: `${links.docs}/docs/cryptos/deep-dives/keys-never-leave-tpm`,
  },
  {
    id: "cli",
    label: "cryptosctl, for Linux, macOS and Windows",
    status: "Available",
    arch: "amd64 and arm64",
    guideLabel: "cryptosctl reference",
    guideHref: `${links.docs}/docs/cryptos/reference/cryptosctl`,
  },
  {
    id: "manager",
    label: "FleetOS Manager, Helm chart for your own Kubernetes",
    status: "Available",
    arch: "amd64 and arm64",
    guideLabel: "Helm install guide",
    guideHref: kubernetes.guideHref,
  },
  {
    id: "proxmox",
    label: "Installer ISO, for a Proxmox VE VM with a vTPM",
    status: "Available",
    arch: "amd64 only",
    guideLabel: "Create a Proxmox VE VM",
    guideHref: `${links.docs}/docs/cryptos/install-deploy/proxmox-vm`,
  },
  { id: "bare-metal", label: "Bare metal", status: "Not yet available", arch: "None published" },
];

export interface DownloadAsset {
  label: string;
  name: string;
  sizeBytes: number;
  sizeLabel: string;
  href: string;
}

export const downloads: DownloadAsset[] = [
  {
    label: "Installer ISO for Proxmox VE, unsigned (TPM-sealed keys)",
    name: `cryptos-amd64-proxmox-unsigned-${BUILD}.iso`,
    sizeBytes: 49711104,
    sizeLabel: "47.4 MiB",
  },
  {
    label: "Installer ISO for VMware, unsigned (TPM-sealed keys)",
    name: `cryptos-amd64-vmware-unsigned-${BUILD}.iso`,
    sizeBytes: 49702912,
    sizeLabel: "47.4 MiB",
  },
  {
    label: "Installer ISO for VMware, unsigned, nodeid variant (no TPM)",
    name: `cryptos-amd64-vmware-nodeid-unsigned-${BUILD}.iso`,
    sizeBytes: 49702912,
    sizeLabel: "47.4 MiB",
  },
  {
    label: "The UKI inside the Proxmox ISO, unsigned",
    name: `cryptos-amd64-proxmox-${BUILD}.uki.unsigned`,
    sizeBytes: 23618048,
    sizeLabel: "22.5 MiB",
  },
  {
    label: "The UKI inside the VMware ISO, unsigned",
    name: `cryptos-amd64-vmware-${BUILD}.uki.unsigned`,
    sizeBytes: 23613952,
    sizeLabel: "22.5 MiB",
  },
  {
    label: "The UKI inside the nodeid ISO, unsigned",
    name: `cryptos-amd64-vmware-nodeid-${BUILD}.uki.unsigned`,
    sizeBytes: 23613952,
    sizeLabel: "22.5 MiB",
  },
  {
    label: "cryptosctl for Linux, amd64",
    name: `cryptosctl-linux-amd64-${BUILD}`,
    sizeBytes: 13832354,
    sizeLabel: "13.2 MiB",
  },
  {
    label: "cryptosctl for Linux, arm64",
    name: `cryptosctl-linux-arm64-${BUILD}`,
    sizeBytes: 12910754,
    sizeLabel: "12.3 MiB",
  },
  {
    label: "cryptosctl for macOS, Intel",
    name: `cryptosctl-darwin-amd64-${BUILD}`,
    sizeBytes: 14248224,
    sizeLabel: "13.6 MiB",
  },
  {
    label: "cryptosctl for macOS, Apple silicon",
    name: `cryptosctl-darwin-arm64-${BUILD}`,
    sizeBytes: 13376706,
    sizeLabel: "12.8 MiB",
  },
  {
    label: "cryptosctl for Windows, amd64",
    name: `cryptosctl-windows-amd64-${BUILD}.exe`,
    sizeBytes: 14313472,
    sizeLabel: "13.7 MiB",
  },
  {
    label: "cryptosctl for Windows, arm64",
    name: `cryptosctl-windows-arm64-${BUILD}.exe`,
    sizeBytes: 13159424,
    sizeLabel: "12.5 MiB",
  },
  {
    label: "Build record",
    name: "build-manifest.json",
    sizeBytes: 968,
    sizeLabel: "968 B",
  },
  {
    label: "Checksums for every file above",
    name: "SHA256SUMS",
    sizeBytes: 1526,
    sizeLabel: "1.5 KiB",
  },
].map((asset) => ({ ...asset, href: `${RELEASES}/download/${release.version}/${asset.name}` }));

export const verify = {
  command: "sha256sum -c SHA256SUMS --ignore-missing",
  secureBootHref: `${links.docs}/docs/cryptos/install-deploy/secure-boot`,
};
