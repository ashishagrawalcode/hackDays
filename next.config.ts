import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    largePageDataBytes: 256 * 1024,
  }
};

export default nextConfig;
