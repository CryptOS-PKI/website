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
// Docusaurus's Tabs remember a tab group's choice (groupId) in browser
// storage. Before the visitor accepts the cookie choice, a group keeps its
// choice in the URL instead (queryString, named after the group), so tab
// groups on a page still switch together and nothing is stored. After they
// accept, the props pass through unchanged.
type TabsStorageProps = {
  groupId?: string;
  queryString?: string | boolean;
};

export function tabsWithoutStorage<P extends TabsStorageProps>(props: P, accepted: boolean): P {
  if (accepted || !props.groupId) return props;
  const queryString = typeof props.queryString === 'string' ? props.queryString : props.groupId;
  return {...props, groupId: undefined, queryString};
}
