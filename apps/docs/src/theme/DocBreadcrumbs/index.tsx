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
import DocBreadcrumbsOriginal from '@theme-original/DocBreadcrumbs';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';
import {stripEmoji} from '@cryptos-pki/frame/emoji';

import {DocToolbar} from '@site/src/components/doc-toolbar';

// The breadcrumb line carries the doc toolbar at its right end. The two
// share one line of a fixed height on every doc page: a long trail is cut
// with an ellipsis (src/css/custom.css), and the full trail is the line's
// title, so the toolbar never wraps and the page title sits at the same
// height everywhere. On a page with no breadcrumbs the toolbar still takes
// this spot. On phones the toolbar always has a line of its own under the
// breadcrumbs.
export default function DocBreadcrumbs(): ReactNode {
  const breadcrumbs = useSidebarBreadcrumbs();
  const trail = breadcrumbs?.map((item) => stripEmoji(item.label)).join(' › ');
  return (
    <div className="doc-toolbar-row">
      <div className="doc-toolbar-row__crumbs" title={trail || undefined}>
        <DocBreadcrumbsOriginal />
      </div>
      <DocToolbar />
    </div>
  );
}
