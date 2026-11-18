---
title: "🔎 Check the source you built"
---

# 🔎 Check the source you built

A CryptOS release is a tag, its notes and the source archive at that tag. `cryptos-appliance` also attaches unsigned VMware and Proxmox VE amd64 ISOs and UKIs and `cryptosctl` binaries built from the tag, and `cryptos-manager` publishes its image and Helm chart to ghcr.io. Nothing the project publishes is signed with a Secure Boot key. Whether you build from source or check a download, the thing worth checking is that the source is really the source the release points at.

## 1. Check the tag's commit

Every release names the commit it was cut from, in the release notes and in the pins that reference it (for example `cryptos-appliance`'s pin of `cryptos-node`, or `cryptos-manager`'s release pin of a `cryptos-web` commit). Compare that SHA with the one you have checked out:

```bash
git fetch --tags
git rev-parse v0.1.0^{commit}
git log -1 --format=%H
```

The two commits should match. `^{commit}` resolves an annotated tag to the commit it points at, so this works whether the tag is lightweight or annotated.

## 2. Verify the tag's signature, if it's signed

Check whether a tag carries a GPG signature before relying on one:

```bash
git cat-file -p v0.1.0 | grep -q "^-----BEGIN PGP SIGNATURE-----" && echo signed || echo "not signed"
```

If it is, verify it with the maintainer's public key imported into your keyring:

```bash
git verify-tag v0.1.0
```

:::info[Not every tag is signed]
CryptOS-PKI doesn't sign every release tag today. Where a tag isn't signed, the commit-SHA comparison above is the check that matters; don't treat an unsigned tag as unverified on its own; treat it the same as any other commit you build from.
:::

## 3. Check the pins a build resolves

A build pulls in more than the one repository you cloned:

- **`cryptos-appliance`** pins `cryptos-node` in `go.mod`; `go.sum` pins every dependency's content hash. `go mod verify` checks your local module cache against `go.sum`.
- **`cryptos-manager`** pins `cryptos-node` the same way, and builds its release image from the `cryptos-web` release with the same tag (the two are versioned in lockstep). The workflow fails if that `cryptos-web` release isn't published.
- **`cryptos-web`**'s `package-lock.json` pins every npm dependency by resolved version and integrity hash; `npm ci` refuses to install anything that doesn't match.

```bash
go mod verify
npm ci   # fails closed on an integrity mismatch
```

## 4. Know what "tested" means

CI builds the exact tagged source on GitHub-hosted runners, checks that the unsigned image builds reproducibly, and boots it in QEMU with a software TPM before the assets are attached. That run includes an in-place upgrade from an earlier build, a rollback and a second upgrade. It runs on GitHub's infrastructure, not yours -- it tells you the source was provably buildable and bootable at that commit, not that the binary in front of you matches it. Building from the same commit yourself, with the checks above, is what closes that gap.
