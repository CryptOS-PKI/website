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
import type {ComponentProps, ReactNode} from 'react';
import {useActiveDocContext} from '@docusaurus/plugin-content-docs/client';
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

type Props = ComponentProps<typeof DocsVersionDropdownNavbarItem>;

// The docs version dropdown for one docs instance, in the doc toolbar
// (doc-toolbar.tsx). Off a doc page it renders nothing. Used outside the
// navbar config, it skips the defaults the built-in 'docsVersionDropdown'
// type gets, so they're set here.
export function DocsVersionNavbarItem({dropdownItemsBefore = [], dropdownItemsAfter = [], ...props}: Props): ReactNode {
  const {activeVersion} = useActiveDocContext(props.docsPluginId);
  if (!activeVersion) return null;
  return (
    <DocsVersionDropdownNavbarItem
      dropdownItemsBefore={dropdownItemsBefore}
      dropdownItemsAfter={dropdownItemsAfter}
      {...props}
    />
  );
}
