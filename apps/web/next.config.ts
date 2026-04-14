import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Force Turbopack to transpile these CJS packages correctly
  transpilePackages: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],

  // Proxy API calls to backend gateway
  async rewrites() {
    const backendUrl = process.env.API_URL || "http://127.0.0.1:3000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
