import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.sevima-instaapp.hkennandya.yuivastudio.com",
      },
    ],
  },
};

export default nextConfig;