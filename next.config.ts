import type { NextConfig } from "next";

const NEXT_PUBLIC_BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL; // Read from .env

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Calls to `/api/...` on frontend
        destination: `${NEXT_PUBLIC_BACKEND_API_URL}/:path*`, // Forward to backend
      },
    ];
  },
};

export default nextConfig;