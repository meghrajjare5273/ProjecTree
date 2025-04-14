import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "ogopptndxf9vyzxi.public.blob.vercel-storage.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
    ],
    //  formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: [
      "@chakra-ui/react",
      "lucide-react",
      "@mui/material",
      "@mui/icons-material",
      "react-icons",
    ],
    serverComponentsHmrCache: true,
  },
  compress: true,
  poweredByHeader: false,
};
export default nextConfig;

//   async rewrites() {
//     return [
//       {
//         source: "/api/websocket",
//         destination: "/api/websocket",
//       },
//     ];
//   },
// };

// export default {
//   ...nextConfig,
//   webpack: (config: { plugins: { apply: (compiler: any) => void; }[]; }, { isServer }: any) => {
//     if (isServer) {
//       config.plugins.push({
//         apply: (compiler: any) => {
//           compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
//             // No-op, just ensuring server compatibility
//           });
//         },
//       });
//     }
//     return config;
//   },
// };
