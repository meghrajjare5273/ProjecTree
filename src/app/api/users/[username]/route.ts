import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        projects: {
          include: {
            comments: {
              include: {
                user: { select: { username: true, image: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        events: {
          include: {
            comments: {
              include: {
                user: { select: { username: true, image: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // console.log(user);
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
