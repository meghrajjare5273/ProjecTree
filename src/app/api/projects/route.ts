/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Optimized GET endpoint with pagination and efficient querying
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50 items
    const offset = (page - 1) * limit;
    const userId = searchParams.get("userId");
    const tags = searchParams.get("tags")?.split(",");

    // Build efficient where clause
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (tags && tags.length > 0) {
      whereClause.tags = {
        hasSome: tags, // Use PostgreSQL array operations
      };
    }

    // Use cursor-based pagination for better performance
    const lastId = searchParams.get("lastId");
    const cursorOption = lastId ? { id: lastId } : undefined;

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            image: true,
            id: true, // Include id for efficient joins
          },
        },
        _count: {
          select: {
            comments: true, // Get comment count efficiently
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }, // Secondary sort for consistency
      ],
      take: limit,
      skip: lastId ? 1 : offset,
      cursor: cursorOption,
    });

    // Get total count only when needed (first page)
    let totalCount = undefined;
    if (page === 1) {
      totalCount = await prisma.project.count({
        where: whereClause,
      });
    }

    return NextResponse.json(
      {
        data: projects,
        pagination: {
          page,
          limit,
          totalCount,
          hasMore: projects.length === limit,
          lastId: projects.length > 0 ? projects[projects.length - 1].id : null,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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

// Optimized POST with transaction for data consistency
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

    // Use transaction for data consistency
    const project = await prisma.$transaction(async (tx) => {
      // Create project
      const newProject = await tx.project.create({
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
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return newProject;
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

// Additional optimized endpoints...
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

    // Efficient update with selective field updates
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    updateData.updatedAt = new Date();

    const project = await prisma.project.update({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the project
      },
      data: updateData,
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
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

    // Use transaction for safe deletion
    await prisma.$transaction(async (tx) => {
      // Delete comments first (cascade should handle this, but explicit is safer)
      await tx.comment.deleteMany({
        where: { projectId: id },
      });

      // Delete the project
      await tx.project.delete({
        where: {
          id,
          userId: session.user.id,
        },
      });
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
