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
import type { MetaFunction } from "react-router";

import { Downloads } from "~/components/downloads";
import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { Strip } from "~/components/strip";
import { footer, links, meta as siteMeta, nav } from "~/content/cryptos";
import { downloads, installTargets, kubernetes, release, verify } from "~/content/release";

const title = `Releases -- ${siteMeta.siteName}`;
const description = `Download CryptOS ${release.version}: the unsigned installer images, cryptosctl and FleetOS Manager, and how to check them.`;

export const meta: MetaFunction = () => [
  { title },
  { name: "description", content: description },
  { property: "og:site_name", content: siteMeta.siteName },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: `${siteMeta.url}releases` },
  { name: "twitter:card", content: "summary" },
];

// The Releases page: the current release's downloads, kept off the home page
// and out of the footer.
export default function Releases() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Strip links={links} />
      <Nav links={nav.links} />
      <main id="main">
        <Section
          eyebrow="Releases"
          heading={`${release.version} is out.`}
          lede={`Published ${release.publishedOn}. This is a pre-release: until v1.0.0, any release may change fundamentally.`}
        >
          <Downloads
            version={release.version}
            pageHref={release.pageHref}
            targets={installTargets}
            assets={downloads}
            manager={kubernetes}
            verifyCommand={verify.command}
            secureBootHref={verify.secureBootHref}
          />
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
