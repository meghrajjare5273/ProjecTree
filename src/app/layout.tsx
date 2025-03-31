import type React from "react";
// src/app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import "./globals.css";
import { Inter, Poppins, Playfair_Display } from "next/font/google";

// Load Inter font with more weights for better typography
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

// Add Poppins as a modern alternative
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

// Add Playfair Display for elegant headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = constructMetadata({});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Preconnect to domains you'll be fetching from */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-poppins antialiased`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
