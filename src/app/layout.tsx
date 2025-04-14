import type React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import "./globals.css";
import { Inter, Poppins, Playfair_Display } from "next/font/google";

// Load fonts with display=swap for better performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"], // Reduce number of font weights
  variable: "--font-inter",
});

// Reduce font weights for better performance
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"], // Reduce number of font weights
  variable: "--font-poppins",
});

// Reduce font weights for better performance
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"], // Reduce number of font weights
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
