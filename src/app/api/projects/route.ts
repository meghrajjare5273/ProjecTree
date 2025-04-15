import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Fetch all projects (GET)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      take: 5,
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { data: projects },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// Create a new project (POST)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, images, tags, openForCollaboration } =
      await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        openForCollaboration: openForCollaboration || false,
        images: images || [],
        tags: tags || [],
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// Update a project (PUT)
export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, description, images, tags } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id, userId: session.user.id },
      data: {
        title,
        description,
        images,
        tags,
      },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ data: project }, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// Delete a project (DELETE)
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: "Project deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
