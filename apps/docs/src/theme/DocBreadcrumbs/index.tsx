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
import {useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';
import {useHomePageRoute} from '@docusaurus/theme-common/internal';
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData';
import {stripEmoji} from '@cryptos-pki/frame/emoji';

import {DocToolbar} from '@site/src/components/doc-toolbar';

// The breadcrumb line carries the doc toolbar at its right end, on one line
// of a fixed height on every doc page, so the page title always starts at
// the same y. When the trail doesn't fit beside the toolbar, the crumbs
// above the page fold, oldest first, into one "…" item (its title names
// them), so the current page keeps its full name whenever it fits; only
// once every other crumb has folded does the current page's name end in an
// ellipsis. The full trail is the line's title. On a page with no
// breadcrumbs the toolbar still takes this spot; on phones it has a line of
// its own under the breadcrumbs (src/css/custom.css).
export default function DocBreadcrumbs(): ReactNode {
  const breadcrumbs = useSidebarBreadcrumbs();
  const homePageRoute = useHomePageRoute();
  const listRef = useRef<HTMLUListElement>(null);
  const [folded, setFolded] = useState(0);
  // Bumped on every fresh measure, so folding runs again even when it
  // restarts from a fold count it already had.
  const [pass, setPass] = useState(0);
  const count = breadcrumbs?.length ?? 0;
  const trailKey = breadcrumbs?.map((item) => item.label).join('\u0000') ?? '';
  const lastWidth = useRef(-1);

  // A new width (or a new page) starts again from the whole trail.
  useLayoutEffect(() => {
    const list = listRef.current;
    const restart = () => {
      setFolded(0);
      setPass((value) => value + 1);
    };
    restart();
    if (!list || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next === lastWidth.current) return;
      lastWidth.current = next;
      restart();
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [trailKey]);

  // Fold one more crumb while the trail overflows or the current page's
  // name is cut, until only the current page is left unfolded.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || folded >= count - 1) return;
    const current = list.querySelector<HTMLElement>('.breadcrumbs__item:last-child .breadcrumbs__link');
    const overflows = list.scrollWidth > list.clientWidth + 1;
    const cut = current ? current.scrollWidth > current.clientWidth + 1 : false;
    if (overflows || cut) setFolded((value) => value + 1);
  }, [folded, count, pass]);

  if (!breadcrumbs) return <Row trail={undefined} list={null} />;
  const labels = breadcrumbs.map((item) => stripEmoji(item.label));
  const shown = breadcrumbs.slice(folded);

  const list = (
    <>
      <DocBreadcrumbsStructuredData breadcrumbs={breadcrumbs} />
      <nav className={ThemeClassNames.docs.docBreadcrumbs} aria-label="Breadcrumbs">
        <ul className="breadcrumbs" ref={listRef}>
          {homePageRoute && <HomeBreadcrumbItem />}
          {folded > 0 && (
            <li className="breadcrumbs__item breadcrumbs__item--folded">
              <span className="breadcrumbs__link" title={labels.slice(0, folded).join(' › ')}>
                …
              </span>
            </li>
          )}
          {shown.map((item, index) => {
            const isLast = folded + index === count - 1;
            const href = item.type === 'category' && item.linkUnlisted ? undefined : item.href;
            return (
              <li
                key={folded + index}
                className={clsx('breadcrumbs__item', {'breadcrumbs__item--active': isLast})}>
                {isLast || !href ? (
                  <span className="breadcrumbs__link">{item.label}</span>
                ) : (
                  <Link className="breadcrumbs__link" href={href}>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
  return <Row trail={labels.join(' › ')} list={list} />;
}

function Row({trail, list}: {trail: string | undefined; list: ReactNode}): ReactNode {
  return (
    <div className="doc-toolbar-row">
      <div className="doc-toolbar-row__crumbs" title={trail || undefined}>
        {list}
      </div>
      <DocToolbar />
    </div>
  );
}
