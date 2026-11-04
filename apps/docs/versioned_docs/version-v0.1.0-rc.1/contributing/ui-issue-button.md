---
title: "🐞 Reporting a UI problem"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Pre10Notice from '@site/docs/_partials/pre-1-0-notice.mdx';

# 🐞 Reporting a UI problem

:::tip[Works today]
This describes `cryptos-web` as it works right now.
:::

This page is for anyone building the Fleet Manager console (`cryptos-web`) from source who hits a UI bug and wants to file a useful bug report. It covers the development-only **Copy for UI issue** button: what turns it on, what it collects, and the guarantee that it never ships.

## Turn it on

The button needs two separate switches on. Each is off by default, and either one being off is enough to keep the button out of what you see.

1. **The console build.** Set `DEV_UI_ISSUE_COPY=true` before starting the Vite dev server or building the console. Without it, the button's code is not compiled into the bundle at all.

   <Tabs groupId="os" queryString>
   <TabItem value="unix" label="Linux / macOS" default>

   ```bash
   DEV_UI_ISSUE_COPY=true npm run dev
   ```

   </TabItem>
   <TabItem value="windows" label="Windows (PowerShell)">

   ```powershell
   $env:DEV_UI_ISSUE_COPY = "true"; npm run dev
   ```

   </TabItem>
   </Tabs>

2. **The manager you're pointed at.** The console only renders the button when the page it's served from advertises `<meta name="cryptos-dev-ui-issue-copy" content="true">`. The manager adds that tag when it starts with `CRYPTOS_DEV_UI_ISSUE_COPY=true` set.

   <Tabs groupId="os" queryString>
   <TabItem value="unix" label="Linux / macOS" default>

   ```bash
   CRYPTOS_DEV_UI_ISSUE_COPY=true ./manager
   ```

   </TabItem>
   <TabItem value="windows" label="Windows (PowerShell)">

   ```powershell
   $env:CRYPTOS_DEV_UI_ISSUE_COPY = "true"; .\manager.exe
   ```

   </TabItem>
   </Tabs>

With both set, a small copy button appears over the console. Selecting it copies a single line of JSON to your clipboard and announces "Copied".

:::caution[The button never ships in a release build]
A release console build is compiled without `DEV_UI_ISSUE_COPY`, so the button's code is absent regardless of the manager's setting. A CI check also scans every release bundle for the button's marker and fails the build if it finds it, so there is no way for the button to reach a built artifact a release ships.
:::

## What the bundle holds

The copied bundle is one line of minified JSON, schema version 1, built with only these keys (empty ones are left out):

| Key | What it is |
|---|---|
| `v` | Schema version (`1`) |
| `product`, `app` | Fixed identifiers (`"cryptos"`, `"cryptos-web/console"`) |
| `sha` | The build's commit SHA |
| `route`, `path` | The matched route **pattern** (for example `/nodes/:nodeId`), never the live URL |
| `params` | Route parameters, kept only when they look like an opaque id (a ULID or a UUID) |
| `role` | Your access level, if the app can read it from context at the time |
| `vw`, `vh`, `dpr` | Viewport width, height and device pixel ratio |
| `ua`, `locale`, `theme` | Browser user agent, locale and the active light/dark theme |
| `t` | The time, as ISO 8601 with the `America/New_York` offset |
| `clicked` | The `data-testid` of the last clicked element, or a tag-and-class selector built without reading its text |
| `lastErr`, `recentErrors` | Up to five recent client errors (window errors, unhandled promise rejections, failed API calls), each redacted and truncated to 200 characters |

## What it never holds

The bundle is built to carry nothing that identifies a person, a certificate or a deployment:

- No secrets, tokens, cookies, query strings or form data.
- No certificate subject, fingerprint, serial, operator name, or any other identity.
- No hostnames or IP addresses: any URL, bare hostname or IP found in an error message is stripped before the message is kept.

Route parameters are filtered the same way: a value is kept only when it matches a ULID or UUID shape, so a certificate serial, an operator name or any other identifying value in the URL is dropped rather than copied.

## Using it

1. Reproduce the problem.
2. Select the copy button. It writes the bundle to your clipboard and shows "Copied".
3. Paste the bundle into the issue or chat message describing the problem. It's meant for a machine or a reviewer to read, not for prose, so it's fine to paste as-is alongside your own description of what you expected.

<Pre10Notice />
