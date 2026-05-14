import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coverartarchive.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.coverartarchive.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "archive.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
