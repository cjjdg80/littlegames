import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.gamedistribution.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
