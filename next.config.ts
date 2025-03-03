import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // protocol: "https",
        hostname: "ogopptndxf9vyzxi.public.blob.vercel-storage.com",
        // pathname: "/[username]",
      },
    ],
  },
};

export default nextConfig;
