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
import type { ReactNode } from "react";

// The cookie choice, in the frame's style: a small bar at the bottom of the
// page with Accept and Decline. It shows only when a site's consent store is
// asking (a visitor changed a preference before answering), so readers who
// never change anything never see it. Plain classes from site-frame.css, no
// framework beyond React.

export const ConsentBanner = ({
  onAccept,
  onDecline,
  children,
}: {
  onAccept: () => void;
  onDecline: () => void;
  children?: ReactNode;
}) => (
  <div aria-label="Cookie choice" className="frame-consent" role="region">
    <p className="frame-consent__text">
      {children ?? (
        <>
          Remember this setting on this device? It&apos;s kept in your browser&apos;s storage and
          used for nothing else: no tracking, no analytics.
        </>
      )}
    </p>
    <div className="frame-consent__actions">
      <button className="frame-consent__button" onClick={onDecline} type="button">
        Decline
      </button>
      <button
        className="frame-consent__button frame-consent__button--primary"
        onClick={onAccept}
        type="button"
      >
        Accept
      </button>
    </div>
  </div>
);
