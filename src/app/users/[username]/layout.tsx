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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const username = (await params).username;

  return {
    title: `@${username} - ProjecTree`,
    description: `View @${username}'s profile, projects, and events on ProjecTree.`,
    openGraph: {
      title: `@${username}`,
      description: `Check out ${username}'s contributions, projects, and upcoming events.`,
      type: "profile",
    },
  };
}

export default function UsernameLayout({
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
