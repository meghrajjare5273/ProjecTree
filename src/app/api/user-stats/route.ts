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
    // Get actual post count (projects + events)
    const [projectCount, eventCount] = await Promise.all([
      prisma.project.count({
        where: { userId: session.user.id },
      }),
      prisma.event.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Get actual follower count
    const followersCount = await prisma.follow.count({
      where: { followingId: session.user.id },
    });

    // Get actual following count
    const followingCount = await prisma.follow.count({
      where: { followerId: session.user.id },
    });

    return NextResponse.json({
      posts: projectCount + eventCount,
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
