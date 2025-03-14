import type React from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";

// Load font only once at the layout level
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your projects, events, and profile on ProjecTree",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} dark`}
    >
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(31, 41, 55, 0.95)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.95rem",
            },
          }}
        />
      </body>
    </html>
  );
}
