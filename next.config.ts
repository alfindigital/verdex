import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // On-demand verdict pages (live-mode ids not in the static corpus) still do
  // fs reads at runtime — make sure the snapshots ship into the serverless
  // bundles for this route and its OG image.
  outputFileTracingIncludes: {
    "/verdict/[id]": ["./snapshots/**/*.json"],
    "/verdict/[id]/opengraph-image": ["./snapshots/**/*.json"],
  },
};

export default nextConfig;
