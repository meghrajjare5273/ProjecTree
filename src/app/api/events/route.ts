/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Optimized GET with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const offset = (page - 1) * limit;
    const location = searchParams.get("location");
    const upcoming = searchParams.get("upcoming") === "true";
    const userId = searchParams.get("userId");

    // Build efficient where clause
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (location) {
      whereClause.location = {
        contains: location,
        mode: "insensitive",
      };
    }
    if (upcoming) {
      whereClause.date = {
        gte: new Date(),
      };
    }

    // Use cursor pagination for better performance
    const lastId = searchParams.get("lastId");
    const cursorOption = lastId ? { id: lastId } : undefined;

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            image: true,
            id: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: upcoming
        ? [{ date: "asc" }, { id: "asc" }] // Upcoming events by date
        : [{ createdAt: "desc" }, { id: "desc" }], // Recent events
      take: limit,
      skip: lastId ? 1 : offset,
      cursor: cursorOption,
    });

    let totalCount = undefined;
    if (page === 1) {
      totalCount = await prisma.event.count({
        where: whereClause,
      });
    }

    return NextResponse.json(
      {
        data: events,
        pagination: {
          page,
          limit,
          totalCount,
          hasMore: events.length === limit,
          lastId: events.length > 0 ? events[events.length - 1].id : null,
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
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Optimized POST, PUT, DELETE methods similar to projects...
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, date, location, organizer, images } =
      await request.json();

    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Title, description, and date are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location: location || null,
        organizer: organizer || null,
        images: images || [],
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

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT and DELETE methods follow similar optimization patterns...
