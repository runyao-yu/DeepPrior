import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/news/:path*", destination: "/#news", permanent: false },
      { source: "/works/:path*", destination: "/#works", permanent: false },
      { source: "/about/:path*", destination: "/#about", permanent: false },
      { source: "/stellla/:path*", destination: "/#stellla", permanent: false },
      { source: "/contact/:path*", destination: "/#contact", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/mirror/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
