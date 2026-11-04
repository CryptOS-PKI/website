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

import {DocToolbar} from '@site/src/components/doc-toolbar';

// The breadcrumb line carries the doc toolbar at its right end. On a page
// with no breadcrumbs the toolbar still takes this spot, above the title.
export default function DocBreadcrumbs(): ReactNode {
  return (
    <div className="doc-toolbar-row">
      <DocBreadcrumbsOriginal />
      <DocToolbar />
    </div>
  );
}
