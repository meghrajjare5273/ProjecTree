// src/app/projects/[projectId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
// import CommentForm from "@/components/CommentForm"; // We’ll create this later
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Image from "next/image";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: (await params).projectId },
    select: { title: true, description: true },
  });

  if (!project) {
    return { title: "Project Not Found - ProjecTree" };
  }

  return {
    title: `${project.title} - ProjecTree`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const project = await prisma.project.findUnique({
    where: { id: (await params).projectId },
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

  if (!project) {
    notFound();
  }

  const getInitial = (username: string | null): string => {
    if (!username || username.length === 0) return "U";
    return username.charAt(0).toUpperCase();
  };

  // Safely display username
  const displayUsername = (username: string | null): string => {
    return username || "Anonymous User";
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-gray-600 mb-4">{project.description}</p>
        <div className="flex items-center mb-4">
          <Avatar>
            <AvatarImage
              src={project.user.image || "/default-avatar.png"}
              alt={displayUsername(project.user.username)}
            />
            <AvatarFallback>{getInitial(project.user.username)}</AvatarFallback>
          </Avatar>
          <span className="ml-2 text-sm font-medium">
            {displayUsername(project.user.username)}
          </span>
        </div>
        {project.images.length > 0 && (
          <div className="mb-4">
            {project.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`${project.title} image ${index + 1}`}
                className="w-full h-auto rounded-md mb-2"
                width={60}
                height={60}
              />
            ))}
          </div>
        )}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500">
          Created on {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </Card>

      {/* Comments Section */}
      <Card className="mt-6 p-6">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        {project.comments.length > 0 ? (
          project.comments.map((comment) => (
            <div key={comment.id} className="mb-4 border-b pb-4">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage
                    src={project.user.image || "/default-avatar.png"}
                    alt={project.user.username as string}
                  />
                  <AvatarFallback>
                    {getInitial(project.user.username)}
                  </AvatarFallback>
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
        {/* <CommentForm projectId={params.projectId} /> */}
      </Card>
    </div>
  );
}
