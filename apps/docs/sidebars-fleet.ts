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
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The FleetOS Manager docs (/docs/fleet): installing and running a manager,
// its operator CA, and using the web console. CryptOS itself has its own docs
// and sidebar (sidebars.ts, /docs/cryptos).
// Order here is the sidebar order; ids are file paths under fleet/ minus ".md".
const sidebars: SidebarsConfig = {
  fleet: [
    {
      type: 'category',
      label: 'Introduction',
      collapsed: false,
      items: ['overview', 'node-lifecycle'],
    },
    {
      type: 'category',
      label: 'Install and run',
      items: [
        'helm',
        'kv-storage',
        {
          type: 'category',
          label: 'First run',
          link: {type: 'doc', id: 'first-run/index'},
          items: [
            'first-run/create-operator-ca',
            'first-run/start-first-run',
            'first-run/register-operator-ca',
            'first-run/first-admin-certificate',
            'first-run/web-wizard',
            'first-run/break-glass',
          ],
        },
        'cutover-cryptos-node-v1',
      ],
    },
    {
      type: 'category',
      label: 'Operator CA and credentials',
      items: [
        'operator-ca',
        'rotating-the-operator-ca',
        'operator-credentials',
        'migrating-from-operator-ca-node',
        'web-operator-cas',
      ],
    },
    {
      type: 'category',
      label: 'Node trust',
      items: ['node-trust', 'upgrade-node-trust'],
    },
    {
      type: 'category',
      label: 'Using the web UI',
      items: [
        'web-ui',
        'web-fleet-and-nodes',
        'web-node-detail',
        'web-catalogs',
        'web-operators-audit',
        'web-operator-credentials',
        'make-a-credential-request',
        'approvals',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/cryptos-managerctl'],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: ['contributing/ui-issue-button', 'contributing/accessibility-checks'],
    },
    {type: 'link', label: 'CryptOS docs', href: '/docs/cryptos', className: 'sidebar-other-docs'},
  ],
};

export default sidebars;
