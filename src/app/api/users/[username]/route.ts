import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    // Single optimized query with all needed data
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        projects: {
          include: {
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20, // Limit initial load
        },
        events: {
          include: {
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20, // Limit initial load
        },
        _count: {
          select: {
            followers: true,
            following: true,
            projects: true,
            events: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: user },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
