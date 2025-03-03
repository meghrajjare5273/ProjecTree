/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Post from "@/types/posts";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Define the type for the fetched user data
type ProfileUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
};

// Metadata generation for SEO
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true },
  });

  if (!user) {
    return { title: "User not found - ProjecTree" };
  }

  return {
    title: `${user.name || user.username} (@${user.username}) - ProjecTree`,
    description: `Profile of ${
      user.name || user.username
    } on ProjecTree. Explore their projects and events.`,
  };
}

// Page component
export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  // Fetch user by username
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  });

  if (!user) {
    notFound(); // Return 404 if user not found
  }

  // Fetch projects and events simultaneously using prisma.$transaction
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
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Add type field and combine posts
  const projectsWithType = projects.map((project) => ({
    ...project,
    type: "project" as const,
  }));
  const eventsWithType = events.map((event) => ({
    ...event,
    type: "event" as const,
  }));
  const posts: Post[] = [...projectsWithType, ...eventsWithType].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Section */}
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="w-24 h-24">
          <img
            src={user.image || "/default-avatar.png"}
            alt={user.name || user.username || "User"}
            // width={100}
            // height={100}
          />
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      {/* Posts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                {post.type === "project" ? "Project" : "Event"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{post.description}</p>
              {post.images.length > 0 && (
                <Image
                  src={post.images[0]}
                  alt={post.title}
                  className="mt-2 rounded-md max-w-full h-auto"
                />
              )}
              {post.type === "project" && post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              )}
              {post.type === "event" && (
                <div className="mt-2">
                  <p>Date: {new Date(post.date).toLocaleDateString()}</p>
                  {post.location && <p>Location: {post.location}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Posts Message */}
      {posts.length === 0 && (
        <p className="text-center text-muted-foreground mt-6">
          This user hasn’t posted anything yet.
        </p>
      )}
    </div>
  );
}
