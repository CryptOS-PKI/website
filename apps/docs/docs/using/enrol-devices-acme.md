---
title: "🔐 Get certificates with ACME"
---

# 🔐 Get certificates with ACME

Get a certificate for a server from an intermediate or issuing node with an ACME client such as certbot, over ACME (RFC 8555) with the `http-01` challenge.

The node checks that the client controls each name by fetching a token from `http://<name>/.well-known/acme-challenge/` on port 80. It then issues from the profile you named, and stamps the CRL, OCSP and CA Issuers pointers from `pki.revocation_base_url`.

:::info[Before you start]
- An intermediate or issuing node, installed and running, with a certificate profile for servers. A Root never serves ACME.
- `cryptosctl` set up to reach the node: [Setup](./setup.md).
- A DNS name for the ACME endpoint (this page uses `acme.example.org`) and something that terminates TLS for it, such as a reverse proxy.
- DNS names for the servers (this page uses `app1.example.org` and `app2.example.org`), inside a domain you are willing to issue for, that the node can resolve and reach on port 80.
:::

## 1. Add an ACME block and switch it on

Fetch the config as in [Apply config](./config-apply.md), then add a profile for servers and a `pki.acme` block that uses it:

```yaml
pki:
  profiles:
    - name: leaf-server
      key_alg: ECDSA-P384
      validity_days: 90
      key_usage: [digital_signature]
      ext_key_usage: [server_auth]
  acme:
    base_url: https://acme.example.org/acme
    profile: leaf-server
    allowed_identifier_suffixes: [example.org]
    external_account_keys:
      - key_id: ops-team
        hmac_key_base64: <32 random bytes, base64url, no padding>
```

The fields are in [Machine config: ACME and EST](../reference/machine-config-enrollment.md#-acme), including a command that makes the key.

:::caution[An External Account Binding key is required]
With `external_account_keys` set and `allow_anonymous_accounts` left at `false`, the node's directory says `externalAccountRequired: true`, and a client can register an account only with the key ID and the HMAC key. Hand both to whoever runs the client. Anonymous accounts let anyone who can answer an `http-01` challenge order a certificate: see the warning in the reference before you turn them on.
:::

:::warning[Switching ACME on needs a reboot in a maintenance window]
Every change to `pki.acme` reports `requires_reboot=true`. The ACME listener starts only at boot, and the node stops issuing while it restarts. Plan the reboot for a maintenance window.
:::

Apply the file and reboot the node:

```bash
cryptosctl --endpoint 192.0.2.20:443 config apply -f node.yaml
cryptosctl --endpoint 192.0.2.20:443 reboot --confirm "Example Issuing CA G1"
```

Then check that the node reports ACME on:

```bash
cryptosctl --endpoint 192.0.2.20:443 status
```

:::tip[Expected output]
```text
Protocols:       ACME on, EST off, SCEP off, TSA off
```
:::

## 2. Put TLS in front of it

The node's ACME listener serves plain HTTP, on port 8555 unless you set `http_port`. It is meant to sit behind something that terminates TLS, and clients must reach it at the address in `base_url`.

:::danger[base_url must be exactly what clients dial]
Every URL in the directory is built from `base_url`, and the node checks every signed request's `url` against it. If a client reaches the node through a different name or scheme, its requests are refused. Set `base_url` to the public HTTPS address of the terminator, ending in `/acme`.
:::

Point your reverse proxy at the node on port 8555, then read the directory over HTTPS:

```bash
curl https://acme.example.org/acme/directory
```

:::tip[Expected output]
A JSON document with five members:

```json
{
  "newNonce": "https://acme.example.org/acme/new-nonce",
  "newAccount": "https://acme.example.org/acme/new-account",
  "newOrder": "https://acme.example.org/acme/new-order",
  "revokeCert": "https://acme.example.org/acme/revoke-cert",
  "meta": {"externalAccountRequired": true}
}
```
:::

Every URL starts with the `base_url` you set, and `externalAccountRequired` is true.

:::caution[A client inside a Kubernetes cluster must be able to resolve the ACME name]
In-cluster DNS often forwards only to public resolvers, so a name from a private zone such as `acme.example.org` fails. cert-manager reports it on the Issuer as `ErrRegisterACMEAccount: Failed to register ACME account: ... no such host`. Give the cluster DNS a forward or stub for the zone, or, for a client that runs in a pod of its own, add the name to the pod's `hostAliases`.
:::

## 3. Request a certificate

Run the client where it can answer on port 80 for the names you ask for. With certbot, standalone mode, the External Account Binding key and the key type the profile asks for:

```bash
certbot certonly --non-interactive --agree-tos --register-unsafely-without-email \
  --server https://acme.example.org/acme/directory \
  --eab-kid ops-team --eab-hmac-key "$EAB_HMAC_KEY" \
  --key-type ecdsa --elliptic-curve secp384r1 \
  --standalone --preferred-challenges http \
  -d app1.example.org -d app2.example.org
```

:::tip[Expected output]
```text
Account registered.
Requesting a certificate for app1.example.org and app2.example.org

Successfully received certificate.
```
:::

:::warning[Name the curve: the profile pins the key algorithm]
The profile's `key_alg` decides which key the node accepts. With `ECDSA-P384`, a client that defaults to an ECDSA P-256 key, as certbot does, passes the challenges and is then refused when it submits its request:

```text
urn:ietf:params:acme:error:badCSR :: The CSR is unacceptable (e.g., due to a short key) :: ... node: subject ECDSA key must be on P-384, got P-256
```

Ask the client for the profile's algorithm. With certbot that is `--key-type ecdsa --elliptic-curve secp384r1`; in a cert-manager `Certificate` it is `privateKey: {algorithm: ECDSA, size: 384}`.
:::

:::caution[What the node needs to validate a name]
The node resolves each name through its own `network.nameservers`, then fetches the token from port 80 at that address. Only `http-01` is supported, so there are no DNS challenges and no wildcard names. Each name must equal one of `allowed_identifier_suffixes` or sit under one.
:::

## 4. Check the certificate

The client wrote the chain to a file. Check it against your Root, with the Intermediate as the untrusted link:

```bash
openssl verify -CAfile root.pem -untrusted intermediate.pem app1.example.org.pem
openssl x509 -in app1.example.org.pem -noout -text
```

:::tip[Expected output]
```text
app1.example.org.pem: OK
```

The text shows the names you asked for as subject alternative names, the P-384 key, `TLS Web Server Authentication`, `CA:FALSE`, and the three pointers the node stamps:

```text
CA Issuers - URI:http://pki.example.org/ca.cer
OCSP - URI:http://pki.example.org/ocsp
URI:http://pki.example.org/crl
```
:::

## 5. Revoke and check

Revoke a certificate by its serial number on the issuing node, then check the CRL and the OCSP responder:

```bash
cryptosctl --endpoint 192.0.2.20:443 ca list-issued
cryptosctl --endpoint 192.0.2.20:443 ca revoke --serial <serial> --reason 5
cryptosctl --endpoint 192.0.2.20:443 ca crl
openssl ocsp -issuer intermediate.pem -cert app1.example.org.pem -url http://pki.example.org/ocsp -CAfile root.pem -noverify
```

:::tip[Expected output]
`ca crl` lists the serial with reason `5` (cessation of operation), and the OCSP answer changes from `good` to `revoked`:

```text
app1.example.org.pem: revoked
	Reason: cessationOfOperation
```
:::

## What can go wrong

| What you see | Why |
|---|---|
| `badCSR ... subject ECDSA key must be on P-384, got P-256` | The client's key doesn't match the profile's `key_alg`. Name the curve, as in step 3. |
| `no such host` from an in-cluster client | The cluster's DNS can't resolve the name in `base_url`. See the caution in step 2. |
| The challenge fails | The node can't resolve the name through its `network.nameservers`, can't reach port 80 there, or the name is outside `allowed_identifier_suffixes`. |
