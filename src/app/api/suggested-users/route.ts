import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch users who are not the current user
    // In a real app, you might want to fetch users based on common interests, mutual connections, etc.
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        username: { not: null }, // Only users who have completed their profile
        // image: { not: null }, // Only users with profile images
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
      },
      take: 3, // Limit to 3 users
      orderBy: {
        createdAt: "desc", // Get newest users first
      },
    });

    return NextResponse.json({ users: suggestedUsers });
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggested users" },
      { status: 500 }
    );
  }
}
