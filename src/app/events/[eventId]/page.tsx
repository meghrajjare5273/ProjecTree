import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";

// Import components
import EventHeader from "./_components/EventHeader";
import EventGallery from "./_components/EventGallery";
import EventDescription from "./_components/EventDescription";
import EventComments from "./_components/EventComments";
import RelatedEvents from "./_components/RelatedEvents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: (await params).eventId },
    select: { title: true, description: true },
  });

  if (!event) {
    return { title: "Event Not Found - ProjecTree" };
  }

  return {
    title: `${event.title} - ProjecTree`,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.substring(0, 160),
      type: "article",
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch event data
  const event = await prisma.event.findUnique({
    where: { id: (await params).eventId },
    include: {
      user: {
        select: {
          username: true,
          image: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              username: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Fetch current user if logged in
  let currentUser = null;
  if (session) {
    currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-[#1a1a1a] border-[#333333] p-6 md:p-8">
          {/* Event Header */}
          <EventHeader event={event} />

          {/* Event Gallery */}
          <EventGallery images={event.images} title={event.title} />

          {/* Event Description */}
          <EventDescription description={event.description} />

          {/* Event Comments */}
          <EventComments
            eventId={event.id}
            comments={event.comments}
            currentUser={currentUser}
          />
        </Card>

        {/* Related Events */}
        <RelatedEvents currentEventId={event.id} />
      </div>
    </div>
  );
}
