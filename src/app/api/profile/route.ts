import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  // Authenticate the user
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, bio, socialLinks, profileImage } = await request.json();

    if (username != session.user.username) {
      const isUser = await prisma.user.findUnique({
        where: {
          username: username
          // email: email
        },
      });

      if (isUser) {
        return NextResponse.json(
          { error: "Username is Already Taken." },
          { status: 404 }
        );
      }
    }

    // Validate input
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Update the user's profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        bio,
        socialLinks: socialLinks
          ? JSON.parse(JSON.stringify(socialLinks))
          : null, // Ensure valid JSON
        image: profileImage,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Authenticate the user
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user's current profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      bio: true,
      socialLinks: true,
      email: true,
      name: true,
      image: true,
    },
  });

  return NextResponse.json({ user }, { status: 200 });
}