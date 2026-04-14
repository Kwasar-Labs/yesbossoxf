import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",

  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },

  // Proxy API calls to backend gateway on :3000
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
