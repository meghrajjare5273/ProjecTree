import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Follow a user (POST)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { followingId } = await request.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "Following ID is required" },
        { status: 400 }
      );
    }

    if (followingId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!userToFollow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId },
      },
    });
    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 409 }
      );
    }

    const follow = await prisma.follow.create({
      data: { followerId: session.user.id, followingId },
    });

    return NextResponse.json({ data: follow }, { status: 201 });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

// Unfollow a user (DELETE)
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { followingId } = await request.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "Following ID is required" },
        { status: 400 }
      );
    }

    const result = await prisma.follow.deleteMany({
      where: { followerId: session.user.id, followingId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Not following this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Unfollowed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}

// Add this to the existing file
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const followingId = searchParams.get("followingId");

  if (!followingId) {
    return NextResponse.json(
      { error: "Following ID is required" },
      { status: 400 }
    );
  }

  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    const isFollowing = !!follow;
    return NextResponse.json({ isFollowing }, { status: 200 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}
