// src/app/events/[eventId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
// import CommentForm from "@/components/CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    select: { title: true, description: true },
  });

  if (!event) {
    return { title: "Event Not Found - ProjecTree" };
  }

  return {
    title: `${event.title} - ProjecTree`,
    description: event.description,
  };
}

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
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

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="flex items-center mb-4">
          <Avatar>
            <AvatarImage
              src={event.user.image || "/default-avatar.png"}
              alt={event.user.username as string}
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <span className="ml-2 text-sm font-medium">
            {event.user.username}
          </span>
        </div>
        <p className="mb-2">
          <strong>Date:</strong> {new Date(event.date).toLocaleString()}
        </p>
        {event.location && (
          <p className="mb-2">
            <strong>Location:</strong> {event.location}
          </p>
        )}
        {event.organizer && (
          <p className="mb-2">
            <strong>Organizer:</strong> {event.organizer}
          </p>
        )}
        {event.images.length > 0 && (
          <div className="mb-4">
            {event.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`${event.title} image ${index + 1}`}
                className="w-full h-auto rounded-md mb-2"
                width={60}
                height={60}
              />
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500">
          Created on {new Date(event.createdAt).toLocaleDateString()}
        </p>
      </Card>

      {/* Comments Section */}
      <Card className="mt-6 p-6">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        {event.comments.length > 0 ? (
          event.comments.map((comment) => (
            <div key={comment.id} className="mb-4 border-b pb-4">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage
                    src={comment.user.image || "/default-avatar.png"}
                    alt={comment.user.username as string}
                  />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <span className="ml-2 font-medium">
                  {comment.user.username}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
        {/* <CommentForm eventId={params.eventId} /> */}
      </Card>
    </div>
  );
}
