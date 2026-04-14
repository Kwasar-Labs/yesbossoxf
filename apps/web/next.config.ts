import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",

  // Explicitly pin Turbopack root to THIS directory — prevents it from
  // walking up and picking a lockfile at C:\Users\Ansh\ as workspace root
  turbopack: {
    root: path.resolve(__dirname),
  },

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
