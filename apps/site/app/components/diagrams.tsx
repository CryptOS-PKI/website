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
// The security review's figures, drawn as inline SVG so they need no image
// files and follow the light and dark themes through the kit's tokens
// (diagrams.css). Every box and arrow is traced to cryptos-node,
// cryptos-appliance or cryptos-manager main; a figure shows nothing the code
// doesn't do.
import type { ReactNode } from "react";

import type { DiagramId } from "~/content/trust/types";

import "./diagrams.css";

type Tone = "default" | "edge" | "core" | "data" | "ext" | "key" | "os" | "warn";

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  sub2?: string;
  tone?: Tone;
}

const Box = ({ x, y, w, h, title, sub, sub2, tone = "default" }: BoxProps) => {
  const lines = 1 + (sub ? 1 : 0) + (sub2 ? 1 : 0);
  const top = y + h / 2 - (lines - 1) * 8 + 4;
  return (
    <g className={`dg-box dg-box--${tone}`}>
      <rect x={x} y={y} width={w} height={h} rx={8} />
      <text x={x + w / 2} y={top} textAnchor="middle" className="dg-title">
        {title}
      </text>
      {sub ? (
        <text x={x + w / 2} y={top + 16} textAnchor="middle" className="dg-sub">
          {sub}
        </text>
      ) : null}
      {sub2 ? (
        <text x={x + w / 2} y={top + 31} textAnchor="middle" className="dg-sub">
          {sub2}
        </text>
      ) : null}
    </g>
  );
};

const Label = ({
  x,
  y,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
}) => (
  <text x={x} y={y} textAnchor={anchor} className="dg-label">
    {children}
  </text>
);

const Line = ({ d, dashed, both }: { d: string; dashed?: boolean; both?: boolean }) => (
  <path
    d={d}
    className={dashed ? "dg-line dg-line--dashed" : "dg-line"}
    markerEnd="url(#dg-arrow)"
    markerStart={both ? "url(#dg-arrow)" : undefined}
  />
);

const Boundary = ({
  x,
  y,
  w,
  h,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}) => (
  <>
    <rect x={x} y={y} width={w} height={h} rx={12} className="dg-boundary" />
    <Label x={x + 14} y={y + 20}>
      {label}
    </Label>
  </>
);

const Frame = ({
  title,
  viewBox,
  children,
}: {
  title: string;
  viewBox: string;
  children: ReactNode;
}) => (
  <svg className="dg" viewBox={viewBox} role="img" aria-label={title}>
    <title>{title}</title>
    <defs>
      <marker
        id="dg-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" className="dg-arrowhead" />
      </marker>
    </defs>
    {children}
  </svg>
);

// Figure 1. The node's surfaces and who may reach each one.
function Architecture() {
  return (
    <Frame title="CryptOS architecture and trust boundaries" viewBox="0 0 960 470">
      <Label x={20} y={36}>
        Off the box
      </Label>
      <Box
        x={20}
        y={56}
        w={190}
        h={64}
        title="cryptosctl"
        sub="your admin certificate"
        sub2="TLS 1.3, mTLS"
        tone="ext"
      />
      <Box
        x={20}
        y={146}
        w={190}
        h={64}
        title="FleetOS Manager"
        sub="optional; dials the node"
        sub2="with the node's admin cert"
        tone="ext"
      />
      <Box
        x={20}
        y={268}
        w={190}
        h={64}
        title="Enrolment clients"
        sub="ACME, EST, SCEP"
        sub2="TSA requesters"
        tone="ext"
      />
      <Box
        x={20}
        y={372}
        w={190}
        h={64}
        title="Relying parties"
        sub="fetch CRL, OCSP"
        sub2="and the CA certificate"
        tone="ext"
      />

      <Boundary x={250} y={20} w={695} h={436} label="CryptOS node: no shell, no SSH, no login" />

      <Box
        x={270}
        y={60}
        w={220}
        h={64}
        title="Management API"
        sub="gRPC, mTLS on :443, one address"
        sub2="trusts only the pinned admin cert"
        tone="edge"
      />
      <Box
        x={270}
        y={146}
        w={220}
        h={64}
        title="Break-glass socket"
        sub="/run/cryptos.sock"
        sub2="on the box only, no network"
        tone="warn"
      />
      <Box
        x={270}
        y={250}
        w={220}
        h={90}
        title="Protocol listeners"
        sub="ACME :8555 · EST :8443 (TLS)"
        sub2="SCEP :80 · TSA :318"
        tone="edge"
      />
      <Label x={380} y={358} anchor="middle">
        on only if enabled; never on a Root
      </Label>
      <Box
        x={270}
        y={372}
        w={220}
        h={64}
        title="Revocation"
        sub="CRL and OCSP over HTTP :80"
        sub2="when a base URL is set"
        tone="edge"
      />

      <Box
        x={530}
        y={150}
        w={200}
        h={80}
        title="CA engine"
        sub="profiles, issuance, revocation"
        sub2="RFC 5280 path length"
        tone="core"
      />
      <Box
        x={530}
        y={268}
        w={200}
        h={64}
        title="Embedded etcd"
        sub="127.0.0.1 only"
        sub2="on the encrypted state disk"
        tone="data"
      />
      <Box
        x={530}
        y={372}
        w={200}
        h={64}
        title="cryptos-console"
        sub="local dashboard"
        sub2="reads the socket"
        tone="os"
      />

      <Box
        x={775}
        y={150}
        w={150}
        h={80}
        title="TPM 2.0"
        sub="CA key made and"
        sub2="used inside it"
        tone="key"
      />

      <Line d="M210,88 H270" />
      <Line d="M210,178 C240,178 240,100 270,100" />
      <Line d="M210,295 H270" />
      <Line d="M210,404 H270" />
      <Line d="M490,92 C512,92 512,180 530,180" />
      <Line d="M490,295 C512,295 512,210 530,210" />
      <Line d="M490,404 C516,404 516,226 530,226" dashed />
      <Line d="M630,230 V268" dashed />
      <Line d="M730,190 H775" both />
      <Label x={752} y={182} anchor="middle">
        sign
      </Label>
    </Frame>
  );
}

// Figure 2. The appliance, from firmware to the CA.
function ApplianceHld() {
  return (
    <Frame title="CryptOS appliance high-level design" viewBox="0 0 960 560">
      <Box
        x={20}
        y={20}
        w={600}
        h={70}
        title="The CA"
        sub="management API :443 · protocol listeners · CA engine · embedded etcd"
        sub2="supervised by PID 1, with the local dashboard on the console"
        tone="core"
      />
      <Boundary
        x={20}
        y={110}
        w={600}
        h={120}
        label="Read-only root: SquashFS (xz), mounted read-only, never written"
      />
      <Box
        x={36}
        y={140}
        w={135}
        h={70}
        title="init"
        sub="Go PID 1"
        sub2="cryptos-node"
        tone="os"
      />
      <Box
        x={183}
        y={140}
        w={135}
        h={70}
        title="cryptosctl"
        sub="on-box client"
        sub2="for the socket"
        tone="os"
      />
      <Box
        x={330}
        y={140}
        w={135}
        h={70}
        title="cryptos-console"
        sub="status screen"
        sub2="on the console"
        tone="os"
      />
      <Box
        x={477}
        y={140}
        w={128}
        h={70}
        title="cryptsetup"
        sub="static, LUKS2"
        sub2="and disk tools"
        tone="os"
      />
      <Box
        x={20}
        y={250}
        w={600}
        h={70}
        title="Unified kernel image (UKI)"
        sub="systemd-stub · Linux kernel · cmdline with lockdown=confidentiality"
        sub2="initrd shim that carries the SquashFS and switches root into it"
        tone="key"
      />
      <Box
        x={20}
        y={340}
        w={600}
        h={60}
        title="UEFI firmware, Secure Boot"
        sub="boots the UKI you signed with your own db key"
        tone="ext"
      />
      <Box
        x={20}
        y={420}
        w={290}
        h={60}
        title="Hardware or VM"
        sub="x86-64, network and console"
        tone="ext"
      />
      <Box
        x={330}
        y={420}
        w={290}
        h={60}
        title="TPM 2.0"
        sub="seals the disk key to PCR 7 + 11"
        tone="key"
      />

      <Label x={660} y={36}>
        Disk (written by the installer)
      </Label>
      <Box
        x={660}
        y={50}
        w={280}
        h={90}
        title="p1: EFI system partition"
        sub="FAT, 512 MiB"
        sub2="the UKI and EFI/cryptos/machine.yaml"
        tone="default"
      />
      <Box
        x={660}
        y={160}
        w={280}
        h={110}
        title="p2: cryptos-state"
        sub="LUKS2, aes-xts-plain64, argon2id"
        sub2="ext4 at /var/lib/cryptos"
        tone="data"
      />
      <Label x={800} y={258} anchor="middle">
        config · etcd · audit
      </Label>

      <Label x={660} y={318}>
        Interfaces
      </Label>
      <Box
        x={660}
        y={330}
        w={280}
        h={52}
        title="One network interface"
        sub="management on its address, protocols on all"
        tone="edge"
      />
      <Box
        x={660}
        y={392}
        w={280}
        h={52}
        title="Local console"
        sub="read-only dashboard; no login prompt"
        tone="edge"
      />
      <Box
        x={660}
        y={454}
        w={280}
        h={52}
        title="No SSH, no shell"
        sub="every change goes through the API"
        tone="warn"
      />

      <Line d="M320,340 V320" />
      <Line d="M320,250 V230" />
      <Line d="M320,110 V90" />
      <Line d="M620,370 H634 V95 H660" dashed />
      <Line d="M620,450 H648 V215 H660" dashed />
    </Frame>
  );
}

// Figure 3. What is measured, what is sealed, and where the CA key lives.
function BootChain() {
  const steps = [
    { title: "UEFI Secure Boot", sub: "checks the UKI against your db key", tone: "ext" as Tone },
    { title: "systemd-stub", sub: "measures the UKI into PCR 11", tone: "key" as Tone },
    { title: "Kernel and initrd shim", sub: "mounts the SquashFS read-only", tone: "os" as Tone },
    { title: "init (PID 1)", sub: "asks the TPM for the state key", tone: "os" as Tone },
    { title: "LUKS2 state partition", sub: "opened at /var/lib/cryptos", tone: "data" as Tone },
    { title: "CA ready", sub: "key blob loaded from etcd into the TPM", tone: "core" as Tone },
  ];
  return (
    <Frame title="Boot chain and TPM key custody" viewBox="0 0 960 520">
      <Label x={20} y={30}>
        Boot, in order
      </Label>
      {steps.map((s, i) => (
        <g key={s.title}>
          <Box x={20} y={44 + i * 78} w={300} h={56} title={s.title} sub={s.sub} tone={s.tone} />
          {i < steps.length - 1 ? <Line d={`M170,${100 + i * 78} V${122 + i * 78}`} /> : null}
        </g>
      ))}

      <Boundary x={400} y={20} w={540} h={400} label="TPM 2.0: nothing leaves it in the clear" />
      <Box x={420} y={56} w={115} h={70} title="PCR 7" sub="Secure Boot" sub2="state" tone="key" />
      <Box x={545} y={56} w={115} h={70} title="PCR 11" sub="the UKI" sub2="(SHA-256)" tone="key" />
      <Box
        x={680}
        y={56}
        w={240}
        h={70}
        title="Storage root key"
        sub="ECC P-256, persistent"
        sub2="handle 0x81000001"
        tone="core"
      />
      <Box
        x={420}
        y={176}
        w={240}
        h={100}
        title="State disk key"
        sub="sealed under PolicyPCR 7 + 11"
        sub2="blob in LUKS2 token 0"
        tone="data"
      />
      <Box
        x={680}
        y={176}
        w={240}
        h={100}
        title="CA private key"
        sub="made in the TPM: P-384 or RSA 3072+"
        sub2="wrapped blob kept in etcd"
        tone="key"
      />
      <Box
        x={420}
        y={316}
        w={500}
        h={84}
        title="What the TPM refuses"
        sub="a changed boot chain can't unseal the disk; an image update"
        sub2="predicts the new PCR 11 and reseals first; CA key export is refused"
        tone="warn"
      />

      <Line d="M320,72 C360,72 360,91 420,91" dashed />
      <Line d="M320,150 C360,150 360,141 400,141 H602 V126" dashed />
      <Line d="M477,126 V176" />
      <Line d="M602,126 V176" />
      <Label x={540} y={162} anchor="middle">
        policy
      </Label>
      <Line d="M740,126 C740,150 640,150 640,176" />
      <Line d="M800,126 V176" />
      <Label x={808} y={156}>
        parent
      </Label>
      <Line d="M320,306 C370,306 370,240 420,240" />
      <Label x={370} y={232} anchor="middle">
        unseal
      </Label>
      <Line d="M320,462 C360,462 360,296 400,296 H800 V276" />
      <Label x={600} y={292} anchor="middle">
        load, sign
      </Label>
    </Frame>
  );
}

// Figure 4. The manager, its operators and the nodes it reaches.
function Fleet() {
  return (
    <Frame title="FleetOS Manager and the fleet" viewBox="0 0 960 540">
      <Label x={20} y={36}>
        Your side
      </Label>
      <Box
        x={20}
        y={56}
        w={200}
        h={64}
        title="Operator CA"
        sub="yours, outside the fleet"
        sub2="signs operator certificates"
        tone="ext"
      />
      <Box
        x={20}
        y={156}
        w={200}
        h={64}
        title="Operators"
        sub="browser or cryptos-managerctl"
        sub2="client cert: viewer, operator, admin"
        tone="ext"
      />
      <Box
        x={20}
        y={276}
        w={200}
        h={64}
        title="Storage you run"
        sub="PostgreSQL, or Valkey/Redis,"
        sub2="or memory for a trial"
        tone="data"
      />

      <Boundary x={260} y={20} w={280} h={500} label="FleetOS Manager: holds no CA key" />
      <Box
        x={280}
        y={56}
        w={240}
        h={64}
        title="Console and fleet API"
        sub="one HTTPS listener"
        sub2="client certificate checked per request"
        tone="edge"
      />
      <Box
        x={280}
        y={146}
        w={240}
        h={64}
        title="Approvals"
        sub="certificate requests, link and"
        sub2="subordinate requests, agent step-ups"
        tone="core"
      />
      <Box
        x={280}
        y={236}
        w={240}
        h={64}
        title="Inventory and audit"
        sub="every node's certificates"
        sub2="hash-chained audit log"
        tone="core"
      />
      <Box
        x={280}
        y={326}
        w={240}
        h={64}
        title="Node credentials"
        sub="each node's admin credential"
        sub2="minted on adoption: P-256, clientAuth"
        tone="key"
      />
      <Box
        x={280}
        y={416}
        w={240}
        h={80}
        title="Carries, never signs"
        sub="CSRs to the node that holds the CA,"
        sub2="signed certificates back"
        tone="default"
      />

      <Label x={590} y={36}>
        The fleet
      </Label>
      <Box
        x={590}
        y={56}
        w={350}
        h={70}
        title="Fresh node, in maintenance"
        sub="adopt: an admin confirms its fingerprint, the manager"
        sub2="installs, then confirms the Mgmt SHA-256 on its console"
        tone="warn"
      />
      <Box
        x={590}
        y={156}
        w={350}
        h={70}
        title="Running node, link requested"
        sub="PENDING: the node signed a challenge with its CA key"
        sub2="and its key is pinned; waits for an admin"
        tone="warn"
      />
      <Box
        x={590}
        y={256}
        w={165}
        h={70}
        title="Root CA node"
        sub="managed"
        sub2="operator surface read-only"
        tone="core"
      />
      <Box
        x={775}
        y={256}
        w={165}
        h={70}
        title="Issuing CA node"
        sub="managed"
        sub2="operator surface read-only"
        tone="core"
      />
      <Box
        x={590}
        y={366}
        w={350}
        h={60}
        title="Each node keeps its own state"
        sub="etcd and the CA key stay on the node,"
        sub2="which keeps working without the manager"
        tone="default"
      />
      <Box
        x={590}
        y={446}
        w={350}
        h={60}
        title="Leaving the fleet"
        sub="decommission wipes the node; remove only forgets it"
        tone="default"
      />

      <Line d="M120,120 V156" dashed />
      <Label x={128} y={142}>
        signs
      </Label>
      <Line d="M220,188 C240,188 240,88 280,88" />
      <Line d="M220,300 C250,300 250,268 280,268" both />
      <Line d="M400,120 V146" />
      <Line d="M400,210 V236" />
      <path d="M520,346 H560 M560,91 V346 H857" className="dg-line" />
      <Line d="M560,91 H590" />
      <Line d="M560,191 H590" />
      <Line d="M560,291 H590" />
      <Line d="M857,346 V326" />
      <Label x={600} y={341}>
        mTLS :443, the manager dials out
      </Label>
      <Line d="M690,226 V256" dashed />
      <Label x={698} y={246}>
        admin approves
      </Label>
    </Frame>
  );
}

const diagrams: Record<DiagramId, () => ReactNode> = {
  architecture: Architecture,
  "appliance-hld": ApplianceHld,
  "boot-chain": BootChain,
  fleet: Fleet,
};

export const Diagram = ({
  id,
  number,
  caption,
}: {
  id: DiagramId;
  number: number;
  caption: string;
}) => {
  const Drawing = diagrams[id];
  return (
    <figure className="dg-figure" id={`figure-${number}`}>
      <Drawing />
      <figcaption>
        <strong>Figure {number}.</strong> {caption}
      </figcaption>
    </figure>
  );
};
