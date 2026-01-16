import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backend) return [];

    return [
      // Tu API real
      { source: "/api/:path*", destination: `${backend}/api/:path*` },

      // Springdoc (docs + UI)
      { source: "/v3/api-docs/:path*", destination: `${backend}/v3/api-docs/:path*` },
      { source: "/swagger-ui/:path*", destination: `${backend}/swagger-ui/:path*` },
      { source: "/swagger-ui.html", destination: `${backend}/swagger-ui.html` },
    ];
  },
};

export default nextConfig;
