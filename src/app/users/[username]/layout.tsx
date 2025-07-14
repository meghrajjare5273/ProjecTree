/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const username = resolvedParams.username;

    return {
      title: `@${username}`,
      description: `View @${username}'s profile, projects, and events on ProjecTree.`,
      openGraph: {
        title: `@${username}`,
        description: `Check out ${username}'s contributions, projects, and upcoming events.`,
        type: "profile",
        images: [
          {
            url: "/og-profile-image.jpg",
            width: 1200,
            height: 630,
            alt: `${username}'s profile`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${username}'s Profile | Community Platform`,
        description: `View ${username}'s profile, projects, and events on our community platform.`,
        images: ["/og-profile-image.jpg"],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "User Profile",
      description: "View user profile on ProjecTree.",
    };
  }
}

export default async function UsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return <div className="flex min-h-screen bg-[#121212]">{children}</div>;
  } catch (error) {
    console.error("Error in layout:", error);
    return <div className="flex min-h-screen bg-[#121212]">{children}</div>;
  }
}
