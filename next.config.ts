import path from "node:path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — a stray lockfile up in
  // C:\Users\SAHIL\ otherwise makes Turbopack guess wrong about
  // where this project's root is.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default withBundleAnalyzer(nextConfig);
