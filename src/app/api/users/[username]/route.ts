// src/app/api/users/[username]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ExtendedProject, ExtendedEvent } from "@/types/posts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        socialLinks: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [projects, events] = await prisma.$transaction([
      prisma.project.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          images: true,
          tags: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          images: true,
          date: true,
          location: true,
          organizer: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const projectsWithType: ExtendedProject[] = projects.map((project) => ({
      ...project,
      type: "project",
      commentCount: project._count.comments,
    }));

    const eventsWithType: ExtendedEvent[] = events.map((event) => ({
      ...event,
      type: "event",
      commentCount: event._count.comments,
    }));

    const posts = [...projectsWithType, ...eventsWithType].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(user);

    return NextResponse.json({
      user: {
        ...user,
        socialLinks: user.socialLinks
          ? typeof user.socialLinks === "string"
            ? JSON.parse(user.socialLinks)
            : user.socialLinks
          : {},
      },
      posts,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
