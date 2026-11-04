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
import { cpSync, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import type { Plugin } from "vite";

const TYPES: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

// Extra public folders: Vite serves only one publicDir, and the site's static
// files live in the shared packages. The dev server answers for them as if
// they were in public/, and the client build copies them to its output root,
// the same place Vite copies public/.
export function sharedPublic(dirs: string[]): Plugin {
  let base = "/";
  return {
    name: "cryptos-shared-public",
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? "").split("?")[0]);
        if (!path.startsWith(base)) return next();
        const rel = normalize(path.slice(base.length));
        if (rel.startsWith("..") || rel.includes(`${sep}..`)) return next();
        for (const dir of dirs) {
          const file = join(dir, rel);
          if (existsSync(file) && statSync(file).isFile()) {
            res.setHeader("Content-Type", TYPES[extname(file)] ?? "application/octet-stream");
            res.end(readFileSync(file));
            return;
          }
        }
        next();
      });
    },
    writeBundle(options) {
      if (this.environment.name !== "client" || !options.dir) return;
      for (const dir of dirs) {
        cpSync(dir, options.dir, { recursive: true });
        this.environment.logger.info(`copied ${dir} into ${options.dir}`);
      }
    },
  };
}
