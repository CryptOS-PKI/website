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
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {ThemeClassNames} from '@docusaurus/theme-common';

// The strip above the header (packages/frame strip.ts), in the announcement
// bar's place. Docusaurus's own announcement bar stores its id and dismissal
// in browser storage on every page load, before any cookie choice, so it
// isn't configured and this draws the strip on its own. It can't be closed,
// so there's nothing to remember.
export default function AnnouncementBar(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const html = siteConfig.customFields?.stripHtml as string;
  return (
    <div className={ThemeClassNames.announcementBar.container} role="banner">
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  );
}
