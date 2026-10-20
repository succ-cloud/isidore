import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/uploads/:name", destination: "/api/media/:name" }],
    };
  },
};

export default nextConfig;
