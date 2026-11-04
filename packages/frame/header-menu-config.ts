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
// The width under which both headers fold their links into the menu button
// (header-menu.tsx). Measured with every header link present: from 1168px up,
// a doc page's header fits the version picker and all the links with the
// same spacing it has at full width; any narrower and they crowd or overlap.
// site-frame.css holds the one media rule at this width; frame.test.ts keeps
// the two in step.
export const HEADER_MENU_BREAKPOINT = 1168;
export const HEADER_MENU_MAX_WIDTH = HEADER_MENU_BREAKPOINT - 1;

// The class each site puts on its header links, which the media rule hides.
export const NAV_LINK_CLASS = "frame-nav__link";

export type MenuEvent = "toggle" | "escape" | "link" | "outside";

export const nextMenuState = (open: boolean, event: MenuEvent): boolean =>
  event === "toggle" ? !open : false;
