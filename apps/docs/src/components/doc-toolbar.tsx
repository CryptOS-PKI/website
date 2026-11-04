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
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';
import {useBrowserConsent} from '@cryptos-pki/frame/use-consent';
import {isFullWidth, setFullWidth} from '@cryptos-pki/frame/full-width';
import {FullWidthToggle} from '@cryptos-pki/frame/full-width-toggle';

import {DocsVersionNavbarItem} from '@site/src/components/docs-version-navbar-item';
import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';

// The doc toolbar, at the top right of the doc column on the breadcrumb
// line (src/theme/DocBreadcrumbs): the version picker for the docs this page
// belongs to (CryptOS or FleetOS Manager, each with its own versions) and
// the full-width switch from packages/frame. Keeping them out of the header
// leaves the header the site's, item for item, at every width. On a narrow
// screen the toolbar wraps under the breadcrumbs. The switch reads the
// stored choice only once the page has hydrated, so the first render
// matches the prerendered page.
export function DocToolbar(): ReactNode {
  const activePlugin = useActivePlugin();
  const {consent} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  if (!activePlugin) return null;
  const full = consent ? isFullWidth(consent) : false;
  return (
    <div className="doc-toolbar">
      <DocsVersionNavbarItem
        docsPluginId={activePlugin.pluginId}
        className="doc-toolbar__version"
        dropdownActiveClassDisabled
        dropdownItemsBefore={[]}
        dropdownItemsAfter={[]}
        // The dropdown builds its own items from the versions.
        items={[]}
      />
      <div className="doc-toolbar__width">
        <FullWidthToggle
          full={full}
          onToggle={() => consent && setFullWidth(consent, !full, document.documentElement)}
        />
      </div>
    </div>
  );
}
