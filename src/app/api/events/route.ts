import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Fetch all events (GET)
export async function GET() {
  try {
    const events = await prisma.event.findMany({
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
      { data: events },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
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

// Create a new event (POST)
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
        images: images || [], // Add this line to handle image URLs
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

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// Update an event (PUT)
export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, description, date, location, organizer } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: { id, userId: session.user.id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        organizer,
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

    return NextResponse.json({ data: event }, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// Delete an event (DELETE)
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
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: "Event deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
