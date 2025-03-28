import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "ogopptndxf9vyzxi.public.blob.vercel-storage.com",
      },
      {
        hostname: "lh3.googleusercontent.com"
      }
    ],
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
