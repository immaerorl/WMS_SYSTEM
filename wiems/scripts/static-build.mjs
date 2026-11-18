// Static export build for GitHub Pages: API routes can't be prerendered
// (no server, no DB), so they are moved aside for the duration of the build.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const apiDir = join(root, "src", "app", "api");
const stashDir = join(root, ".api-stash");

if (existsSync(apiDir)) {
  mkdirSync(stashDir, { recursive: true });
  renameSync(apiDir, join(stashDir, "api"));
}

try {
  execSync("next build", { stdio: "inherit", env: { ...process.env, STATIC_EXPORT: "1" } });
} finally {
  if (existsSync(join(stashDir, "api"))) {
    renameSync(join(stashDir, "api"), apiDir);
  }
}
