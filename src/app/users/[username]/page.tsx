import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Import components
import ProfileHeader from "./_components/ProfileHeader";
import ProfileContent from "./_components/ProfileContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  return {
    title: `@${username}`,
    description: `View @${username}'s profile, projects, and events on ProjecTree.`,
    openGraph: {
      title: `@${username}`,
      description: `Check out ${username}'s contributions, projects, and upcoming events.`,
      type: "profile",
      images: [
        {
          url: "/og-profile-image.jpg",
          width: 1200,
          height: 630,
          alt: `${username}'s profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Profile | Community Platform`,
      description: `View ${username}'s profile, projects, and events on our community platform.`,
      images: ["/og-profile-image.jpg"],
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: {
      username: (await params).username,
    },
    include: {
      projects: {
        include: {
          comments: {
            include: {
              user: { select: { username: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      events: {
        include: {
          comments: {
            include: {
              user: { select: { username: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Transform user data for client components
  const profileUser = {
    id: user.id,
    name: user.name,
    username: user.username || "",
    image: user.image,
    bio: user.bio,
    socialLinks: user.socialLinks || {},
    location: user.location,
    interests: user.interests || [],
    skills: user.skills || [],
    createdAt: user.createdAt.toString(),
    _count: user._count,
  };

  // Transform posts data for client components
  const posts = [
    ...(user.projects || []).map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      type: "project" as const,
      images: project.images,
      tags: project.tags,
      createdAt: project.createdAt.toString(),
      commentCount: project.comments?.length || 0,
      user: {
        username: user.username || "",
        image: user.image,
      },
    })),
    ...(user.events || []).map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: "event" as const,
      images: event.images,
      date: event.date ? event.date.toString() : undefined,
      location: event.location || undefined,
      createdAt: event.createdAt.toString(),
      commentCount: event.comments?.length || 0,
      user: {
        username: user.username || "",
        image: user.image,
      },
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate stats
  const stats = {
    projects: user.projects.length,
    events: user.events.length,
    total: user.projects.length + user.events.length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col">
        {/* Profile Header */}
        <ProfileHeader
          user={profileUser}
          currentUserId={session?.user.id || null}
          stats={stats}
        />

        {/* Profile Content */}
        <ProfileContent posts={posts} username={user.username || ""} />
      </div>
    </div>
  );
}
