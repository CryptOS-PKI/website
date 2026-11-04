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
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useActivePlugin, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {vnextBannerText} from '@site/src/lib/vnext-banner';

type Releases = Record<string, {version: string; upcoming: string}>;

// The banner on every vNext page (the unreleased "current" version of either
// docs), naming the release being built and the current one from that docs'
// own release (packages/frame/release.ts, passed in customFields). Released
// versions get no banner.
export default function DocVersionBanner({className}: {className?: string}): ReactNode {
  const version = useDocsVersion();
  const plugin = useActivePlugin();
  const {siteConfig} = useDocusaurusContext();
  const releases = siteConfig.customFields?.docsReleases as Releases;
  const release = plugin && releases[plugin.pluginId];
  if (version.version !== 'current' || !release) return null;
  return (
    <div
      className={clsx(className, ThemeClassNames.docs.docVersionBanner, 'alert alert--warning margin-bottom--md')}
      role="alert">
      {vnextBannerText(release)}
    </div>
  );
}
