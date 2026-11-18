import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Static export for GitHub Pages: no server, demo data lives in the browser.
  // PPR/cacheComponents is incompatible with `output: export`, so the spread
  // overrides them when building statically. basePath matches the Pages URL
  // https://<user>.github.io/<repo>/
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_DEMO_MODE: "1" },
        cacheComponents: false,
        partialPrefetching: false,
        basePath: "/WMS_SYSTEM",
      }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
