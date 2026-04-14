import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Force Turbopack to transpile these CJS packages correctly
  transpilePackages: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],

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
