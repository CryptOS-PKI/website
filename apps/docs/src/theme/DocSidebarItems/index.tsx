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
import {memo, type ReactNode} from 'react';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';
import DocSidebarItemsOriginal from '@theme-original/DocSidebarItems';
import type DocSidebarItemsType from '@theme/DocSidebarItems';
import type {WrapperProps} from '@docusaurus/types';
import {stripEmoji} from '@cryptos-pki/frame/emoji';

type Props = WrapperProps<typeof DocSidebarItemsType>;

// The sidebar reads as plain text: page titles keep their emoji on the page
// itself, but the sidebar shows the labels without them.
const plain = (item: PropSidebarItem): PropSidebarItem => {
  if (item.type === 'html') return item;
  if (item.type === 'category') return {...item, label: stripEmoji(item.label), items: item.items.map(plain)};
  return {...item, label: stripEmoji(item.label)};
};

function DocSidebarItems({items, ...props}: Props): ReactNode {
  return <DocSidebarItemsOriginal items={items.map(plain)} {...props} />;
}

export default memo(DocSidebarItems);
