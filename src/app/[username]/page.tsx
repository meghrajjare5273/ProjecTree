/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Post from "@/types/posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, FolderIcon, GlobeIcon, UserIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Define extended Post type with comment count
type ExtendedPost = Post & { 
  commentCount: number 
};

// Define the type for the fetched user data
type ProfileUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: Date;
};

// Metadata generation for SEO
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true, bio: true },
  });

  if (!user) {
    return { title: "User not found - ProjecTree" };
  }

  return {
    title: `${user.name || user.username} (@${user.username}) - ProjecTree`,
    description: user.bio || 
      `Profile of ${user.name || user.username} on ProjecTree. Explore their projects and events.`,
  };
}

// Helper function to format dates
function formatDate(date: Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Page component
export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  // Fetch user by username with additional fields
  const user = await prisma.user.findUnique({
    where: { username: params.username },
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
    notFound(); // Return 404 if user not found
  }

  // Fetch projects and events simultaneously using prisma.$transaction
  const [projects, events, commentCount] = await prisma.$transaction([
    prisma.project.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        tags: true,
        createdAt: true,
        _count: {
          select: { comments: true }
        }
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
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.comment.count({
      where: { userId: user.id },
    }),
  ]);

  // Add type field and combine posts
  const projectsWithType = projects.map((project) => ({
    ...project,
    type: "project" as const,
    commentCount: project._count.comments,
  }));
  
  const eventsWithType = events.map((event) => ({
    ...event,
    type: "event" as const,
    commentCount: event._count.comments,
  }));
  
  const posts = [
    ...projectsWithType, 
    ...eventsWithType
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Parse social links if they exist
  const socialLinks = user.socialLinks ? 
    (typeof user.socialLinks === 'string' ? 
      JSON.parse(user.socialLinks) : 
      user.socialLinks as Record<string, string>) : 
    {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Header */}
      <div className="mb-8 bg-card rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="w-32 h-32 rounded-full border-4 border-background">
              <AvatarImage src={user.image || "/default-avatar.png"} alt={user.name || user.username || "User"} />
              <AvatarFallback>
                {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 flex flex-col items-center md:items-start gap-2">
              <div className="flex gap-2">
                <Badge variant="outline" className="px-2 py-1">
                  <UserIcon className="w-3 h-3 mr-1" />
                  {projects.length} Projects
                </Badge>
                <Badge variant="outline" className="px-2 py-1">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {events.length} Events
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <Button key={platform} variant="outline" size="sm" asChild>
                    <Link href={url || "#"} target="_blank" rel="noopener noreferrer">
                      {platform}
                    </Link>
                  </Button>
                ))}
                <Button variant="default" size="sm">
                  Follow
                </Button>
              </div>
            </div>
            
            {/* Bio */}
            {user.bio && (
              <div className="mt-4 p-4 bg-muted/50 rounded-md">
                <p className="text-sm">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        {/* All Posts Tab */}
        <TabsContent value="all">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post as unknown as ExtendedPost} />
              ))}
            </div>
          ) : (
            <EmptyState message="This user hasn't posted anything yet." />
          )}
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects">
          {projectsWithType.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsWithType.map((project) => (
                <PostCard key={project.id} post={project as unknown as ExtendedPost} />
              ))}
            </div>
          ) : (
            <EmptyState message="This user hasn't created any projects yet." />
          )}
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events">
          {eventsWithType.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsWithType.map((event) => (
                <PostCard key={event.id} post={event as unknown as ExtendedPost} />
              ))}
            </div>
          ) : (
            <EmptyState message="This user hasn't created any events yet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Post Card Component
function PostCard({ post }: { post: ExtendedPost }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {post.images && post.images.length > 0 && (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <Badge 
            className="absolute top-2 right-2"
            variant={post.type === "project" ? "default" : "secondary"}
          >
            {post.type === "project" ? "Project" : "Event"}
          </Badge>
        </div>
      )}
      
      <CardHeader className={post.images && post.images.length > 0 ? "pt-4" : "pt-6"}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-1">{post.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span>{formatDate(post.createdAt)}</span>
          {post.type === "event" && post.date && (
            <span>• Event: {new Date(post.date).toLocaleDateString()}</span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm line-clamp-3 mb-2">{post.description}</p>
        
        {post.type === "project" && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{post.tags.length - 3}</Badge>
            )}
          </div>
        )}
        
        {post.type === "event" && post.location && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <GlobeIcon className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{post.location}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquareIcon className="w-4 h-4 mr-1" />
            <span>{post.commentCount}</span> comments
          </Button>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/${post.type}s/${post.id}`}>
            View {post.type}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        {Math.random() > 0.5 ? (
          <FolderIcon className="w-10 h-10 text-primary/60" />
        ) : (
          <CalendarIcon className="w-10 h-10 text-primary/60" />
        )}
      </div>
      <h3 className="text-xl font-medium mb-2">No content to display</h3>
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
}