---
title: "🗝️ Storage with Valkey or Redis"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗝️ Storage with Valkey or Redis

FleetOS Manager keeps its own state (the node inventory, profiles, enrollments, operator credentials and the audit log) in one of three places.

| Mode | How you turn it on | Use it when |
|---|---|---|
| PostgreSQL | `database_url` | The default. Use this unless you have a reason not to. |
| KV | `storage.mode: kv` | You already run Valkey or Redis and would rather not add PostgreSQL. Everything PostgreSQL does works here, including first run, MCP and several replicas. |
| Memory | `storage.mode: memory` | A home lab or a single box. Nothing persists, there's one replica, and there's no first run or MCP. |

You pick one. Setting `database_url` together with a `storage.mode` is refused. This page sets up KV mode with the Helm chart. Like PostgreSQL, the server is yours: the manager and the chart only connect to it.

:::info[Before you start]

- A Valkey 7.2 or later, or Redis 7 or later, server the cluster can reach. Older versions have no ACL selectors.
- Admin access to that server's configuration.
- The [Helm install](./helm.md) requirements other than the database.

:::

## Set up the server

1. Turn on AOF in `valkey.conf`:

   ```text
   appendonly yes
   ```

   :::caution[Turn persistence on first]
   With neither AOF nor RDB snapshots the manager refuses to start. RDB alone is accepted, but writes since the last snapshot are lost in a crash, and health reports `degraded`. Use AOF.
   :::

2. Set up the accounts in the server's ACL file (the file `aclfile` names in `valkey.conf`), with your own passwords. The manager gets a named user of its own, `fleet-manager` here, and the `default` user is turned off:

   ```text
   user default off
   user admin on >ADMIN_PASSWORD ~* &* +@all
   user fleet-manager on >MANAGER_PASSWORD ~{fleet}:state:* -@all +ping +hello +client|setname +client|setinfo +info +config|get +select +hget +hset +hdel +hvals +hkeys +hlen +get +mget +set +del +incr +pexpire +watch +unwatch +multi +exec +discard +eval +evalsha (~{fleet}:audit +xadd +xrange +xlen)
   ```

   The part in brackets is the only grant on the audit stream. The account can add to the stream and read it, and can't delete, trim, overwrite or expire it.

   :::caution[Check what else uses the default user]
   `user default off` stops anyone signing in without a user name. If another client of this server still connects with a password alone, it stops working. Leave that line out until those clients have users of their own.
   :::

   :::danger[Keep this account separate from the admin]
   The manager refuses to start if its account can run `XDEL` or `XTRIM` on the audit stream, so don't reuse an admin account for it. Keep the admin account away from the manager too: it's the one account that could remove the audit log without leaving a sign.
   :::

3. Load the file without a restart. Run this on the Valkey server, as the admin, and type the admin password when it asks:

   ```bash
   valkey-cli --user admin --askpass ACL LOAD
   ```

   It prints `OK`. On Redis the tool is `redis-cli`, with the same options.

   :::info[ACL LOAD needs the ACL file]
   `ACL LOAD` reads the file the server was started with. If you've only just added `aclfile` to `valkey.conf`, restart the server instead.
   :::

4. Check that the manager's user can sign in and can't trim the audit stream. Run this on the Valkey server too, with the manager's password:

   ```bash
   valkey-cli --user fleet-manager --askpass PING
   valkey-cli --user fleet-manager --askpass XTRIM {fleet}:audit MAXLEN 0
   ```

   The first prints `PONG`. The second must print `NOPERM User fleet-manager has no permissions to run the 'xtrim' command`.

5. Create the Secret, with the manager's user and password in the URL. Use `rediss://` if the server has TLS on:

   ```bash
   kubectl -n fleetos create secret generic fm-kv --from-literal=kv-url="redis://fleet-manager:MANAGER_PASSWORD@valkey.example.org:6379/0"
   ```

   A URL with no user, such as `redis://:MANAGER_PASSWORD@`, signs in as the `default` user instead.

   :::caution[Special characters in the password]
   The password sits inside a URL. A `/`, `?`, `#` or `%` in it must be percent-encoded (`%2F`, `%3F`, `%23`, `%25`), or the manager can't parse the URL and refuses to start. Encoding `@` (`%40`) and `:` (`%3A`) too does no harm.
   :::

## Install the chart

1. Install with KV mode on:

   ```bash
   helm install fm oci://ghcr.io/cryptos-pki/charts/fleet-manager --version X.Y.Z -n fleetos --set storage.mode=kv --set storage.kv.existingSecret=fm-kv
   ```

   If the server's certificate comes from a private CA, put the CA in a ConfigMap under the key `ca.crt` and add `--set storage.kv.caConfigMap=<name>`.

2. Check health from inside the cluster, or through your Ingress:

   <Tabs groupId="os" queryString>
   <TabItem value="unix" label="Linux / macOS" default>

   ```bash
   curl -sk https://fleetos.example.org/healthz
   ```

   </TabItem>
   <TabItem value="windows" label="Windows (PowerShell)">

   ```powershell
   (Invoke-WebRequest -SkipCertificateCheck https://fleetos.example.org/healthz).Content
   ```

   `-SkipCertificateCheck` needs PowerShell 7 or later.

   </TabItem>
   </Tabs>

   The answer looks like this:

   ```json
   {"status":"ok","storage":{"mode":"kv","state":"ok","version":"valkey 8.1.11","persistence":"aof","auditChain":"ok"}}
   ```

   `persistence` is `aof`, `rdb-only`, `none` or `unknown`. Anything but `aof` reports `degraded`, with a 200, because the manager still works. While the server is unreachable, readiness fails with a 503 and the pods leave the Service.

## Run more than one replica

The store is shared, so `replicaCount` can go above 1. Every pod needs the adopted nodes' admin keys, so `nodeCreds` must be `ReadWriteMany`, the same as with PostgreSQL. See the [Helm page](./helm.md).

## If the audit chain breaks

Each audit entry is added to the stream `{fleet}:audit` with the SHA-256 of the entry before it, so the entries form a hash chain. The manager verifies the chain when it starts and whenever the log is read.

:::warning[Don't touch the stream yet]
A changed or removed entry shows as `"auditChain": "broken"` in health, and as an error in the manager's log naming the first bad entry. The manager keeps running and the log stays readable, because what's left of it is your evidence. Find out who could reach the server with an admin account before you do anything to the stream. Back up the AOF so you have something to compare against.
:::
