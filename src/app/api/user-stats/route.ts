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
    // For a real application, you would have a followers/following table
    // This is a simplified implementation that counts projects and events as "posts"
    const [projectCount, eventCount] = await Promise.all([
      prisma.project.count({
        where: { userId: session.user.id },
      }),
      prisma.event.count({
        where: { userId: session.user.id },
      }),
    ]);

    // In a real application, you would query actual follower/following relationships
    // For now, we'll generate some reasonable numbers based on the user's activity
    const totalPosts = projectCount + eventCount;
    const followersCount = Math.max(20, totalPosts * 2); // Simulate some followers
    const followingCount = Math.max(15, totalPosts); // Simulate some following

    return NextResponse.json({
      posts: totalPosts,
      followers: followersCount,
      following: followingCount,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
