import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the build rooted at this project when the host has another
  // package-lock.json higher in the directory tree.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
