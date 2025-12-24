import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Proxy /api/* requests to the backend Laravel server running locally.
  // This avoids CORS and lets the frontend call `/api/...` as intended by the axios instance.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
