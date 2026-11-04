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
import type { DownloadAsset, InstallTarget } from "~/content/release";

import "./marketing.css";

interface DownloadsProps {
  version: string;
  pageHref: string;
  targets: InstallTarget[];
  assets: DownloadAsset[];
  manager: { chart: string; chartVersion: string; image: string; guideHref: string };
  verifyCommand: string;
  secureBootHref: string;
}

// The Releases page's body: where the release runs, its files, FleetOS
// Manager on Kubernetes, and how to check what was downloaded. The content
// comes from app/content/release.ts.
export const Downloads = ({
  version,
  pageHref,
  targets,
  assets,
  manager,
  verifyCommand,
  secureBootHref,
}: DownloadsProps) => (
  <div className="downloads">
    <h3 className="downloads__heading">Where it runs</h3>
    <table className="downloads-table">
      <thead>
        <tr>
          <th>Install target</th>
          <th>Status</th>
          <th>CPU</th>
        </tr>
      </thead>
      <tbody>
        {targets.map((target) => (
          <tr key={target.id}>
            <td>
              {target.label}
              {target.guideHref ? (
                <div className="downloads-table__note">
                  <a href={target.guideHref}>{target.guideLabel}</a>
                </div>
              ) : null}
            </td>
            <td>{target.status}</td>
            <td>{target.arch}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3 className="downloads__heading">Download</h3>
    <p className="prose">
      Every image is unsigned on purpose: you sign it with your own key before it boots, so nothing
      in your chain of trust is signed by us. The <a href={secureBootHref}>Secure Boot guide</a>{" "}
      covers enrolling your key and signing the image.
    </p>
    <table className="downloads-table">
      <thead>
        <tr>
          <th>File</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.name}>
            <td>
              <a href={asset.href}>
                <code>{asset.name}</code>
              </a>
              <div className="downloads-table__note">{asset.label}</div>
            </td>
            <td className="downloads-table__size">{asset.sizeLabel}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="prose">
      All the files are on the {version} <a href={pageHref}>release page</a>.
    </p>

    <h3 className="downloads__heading">FleetOS Manager on Kubernetes</h3>
    <p className="prose">
      FleetOS Manager is published as the container image <code>{manager.image}</code> and the Helm
      chart <code>{manager.chart}</code>, version {manager.chartVersion}. The{" "}
      <a href={manager.guideHref}>Helm install guide</a> covers the values it needs.
    </p>

    <h3 className="downloads__heading">How to verify</h3>
    <p className="prose">
      Check the files you downloaded against the published checksums, on Linux or macOS:
    </p>
    <pre className="verify-block">{verifyCommand}</pre>
    <p className="prose">
      The build is meant to be reproducible, so rebuilding from the {version} tag and comparing the
      hashes is an equally good check.
    </p>
  </div>
);
