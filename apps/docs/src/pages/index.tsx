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
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {Hero} from '@cryptos-pki/frame/hero';
import {docsHeroNote} from '@cryptos-pki/frame/hero-content';

import styles from './index.module.css';

type EntryPoint = {
  label: string;
  description: string;
  to: string;
};

type DocsGroup = {
  id: string;
  title: string;
  description: string;
  entries: EntryPoint[];
};

// The two docs, each with its own sidebar and versions: CryptOS itself and
// FleetOS Manager. Each card opens a top-level section of that sidebar.
const docsGroups: DocsGroup[] = [
  {
    id: 'docs-cryptos',
    title: 'CryptOS',
    description: 'The OS itself: building, installing and running a CA node, and getting certificates from it.',
    entries: [
      {
        label: 'Get started',
        description: 'What CryptOS is, why it exists, and where the project stands today.',
        to: '/docs/cryptos',
      },
      {
        label: 'Concepts',
        description: 'Certificates, chains of trust, TPM-sealed keys and the CA roles, explained.',
        to: '/docs/cryptos/concepts/certificates-101',
      },
      {
        label: 'Use cases',
        description: 'Internal TLS, Kubernetes, devices, code signing and an air-gapped root.',
        to: '/docs/cryptos/use-cases/overview',
      },
      {
        label: 'Try it locally',
        description: 'Build an image, boot it, and run the first-boot ceremony.',
        to: '/docs/cryptos/try-it-locally/requirements',
      },
      {
        label: 'Install and deploy',
        description: 'Build a bootable image and install a node to disk.',
        to: '/docs/cryptos/install-deploy/build-bootable-image',
      },
      {
        label: 'Using CryptOS',
        description: 'Set up a node and run it day to day with cryptosctl.',
        to: '/docs/cryptos/using/setup',
      },
      {
        label: 'Reference',
        description: 'The cryptosctl commands, the gRPC API, and machine config.',
        to: '/docs/cryptos/reference/machine-config',
      },
    ],
  },
  {
    id: 'docs-fleet',
    title: 'FleetOS Manager',
    description: 'Running many nodes from one place: installing the manager, its operator CA, and the web console.',
    entries: [
      {
        label: 'Overview',
        description: 'What FleetOS Manager does, and how a node joins and leaves the fleet.',
        to: '/docs/fleet',
      },
      {
        label: 'Install and run',
        description: 'Deploy it with Helm, then the first run: the operator CA and the first admin.',
        to: '/docs/fleet/helm',
      },
      {
        label: 'Operator CA and credentials',
        description: 'Who can sign in, how their credentials are issued, rotated and revoked.',
        to: '/docs/fleet/operator-ca',
      },
      {
        label: 'Using the web UI',
        description: 'The fleet, a node\'s page, certificates, approvals and the audit log.',
        to: '/docs/fleet/web-ui',
      },
    ],
  },
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    // The page description says who the docs are for, as the hero does.
    <Layout description={docsHeroNote}>
      <Hero
        note={docsHeroNote}
        primaryCta={{label: 'Get started', href: useBaseUrl('/docs/cryptos/try-it-locally/requirements')}}
        secondaryCta={{label: 'What is CryptOS?', href: useBaseUrl('/docs/cryptos')}}
      />

      <main>
        {docsGroups.map((group) => (
          <section key={group.id} className={styles.entryPoints} aria-labelledby={group.id}>
            <div className={styles.entryGroupHead}>
              <h2 id={group.id} className={styles.entryGroupTitle}>
                {group.title}
              </h2>
              <p className={styles.entryGroupDescription}>{group.description}</p>
            </div>
            <div className={styles.entryGrid}>
              {group.entries.map((entry) => (
                <Link key={entry.to} className={styles.entryCard} to={entry.to}>
                  <span className={styles.entryLabel}>{entry.label}</span>
                  <span className={styles.entryDescription}>{entry.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.notice}>
          <div className={styles.noticeCard}>
            <p className={styles.noticeTitle}>Pre-1.0: any release can change fundamentally</p>
            <p className={styles.noticeBody}>
              CryptOS is pre-1.0. Until v1.0.0, a release may change configuration, APIs, on-disk
              and state formats, trust setup, and upgrade paths, sometimes with no migration path.
              Running it in production today means accepting that risk.{' '}
              <Link to="/docs/cryptos/introduction/status-roadmap">Read the project status and roadmap</Link>{' '}
              before you decide.
            </p>
          </div>
        </section>

        <section className={styles.productLink}>
          <p>
            Looking for the product overview rather than the documentation?{' '}
            <Link href={siteConfig.customFields?.siteUrl as string}>Visit cryptos-pki.com</Link>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
