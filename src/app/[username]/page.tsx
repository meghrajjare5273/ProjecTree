// src/app/[username]/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExtendedPost, ExtendedProject, ExtendedEvent } from "@/types/posts";
import { motion } from "motion/react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Button,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
  params:{ username: string };
}): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, bio: true },
  });

  if (!user) {
    return { title: "User not found - ProjecTree" };
  }

  return {
    title: `${user.name || user.username} (@${user.username}) - ProjecTree`,
    description:
      user.bio ||
      `Profile of ${
        user.name || user.username
      } on ProjecTree. Explore their projects and events.`,
  };
}

// Helper function to format dates
function formatDate(date: Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
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
    notFound();
  }

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
        _count: { select: { comments: true } },
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
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const projectsWithType: ExtendedProject[] = projects.map((project) => ({
    ...project,
    type: "project",
    commentCount: project._count.comments,
  }));

  const eventsWithType: ExtendedEvent[] = events.map((event) => ({
    ...event,
    type: "event",
    commentCount: event._count.comments,
  }));

  const posts: ExtendedPost[] = [...projectsWithType, ...eventsWithType].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const socialLinks = user.socialLinks
    ? typeof user.socialLinks === "string"
      ? JSON.parse(user.socialLinks)
      : (user.socialLinks as Record<string, string>)
    : {};

  return (
    <Box
      className="relative z-10 flex flex-col items-center min-h-screen pt-20 pb-10"
      sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, md: 4 } }}
    >
      {/* Profile Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full mb-8"
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.7)",
          backdropFilter: "blur(10px)",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* FIX 1: Corrected Box component - moved md breakpoint into sx prop */}
          <Box
            display="flex"
            alignItems="center"
            flexDirection="column"
            sx={{
              md: { alignItems: "start" },
            }}
          >
            <Avatar
              src={user.image || "/default-avatar.png"}
              sx={{
                width: 120,
                height: 120,
                border: "2px solid #facc15",
                mb: 2,
              }}
            />
            <Typography
              className="text-gray-400 text-center md:text-left"
              sx={{ color: "#9ca3af !important" }}
            >
              Member since{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography
              variant="h4"
              className="font-bold"
              sx={{ color: "white !important", mb: 1 }}
            >
              {user.name || user.username}
            </Typography>
            <Typography
              className="text-gray-300"
              sx={{ color: "#d1d5db !important", mb: 2 }}
            >
              @{user.username}
            </Typography>
            {user.bio && (
              <Typography
                className="text-gray-400"
                sx={{ color: "#9ca3af !important", mb: 2 }}
              >
                {user.bio}
              </Typography>
            )}
            <Box display="flex" gap={2} flexWrap="wrap">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <Button
                  key={platform}
                  variant="outlined"
                  size="small"
                  component={Link}
                  href={(url as string) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#facc15 !important",
                    borderColor: "rgba(250, 204, 21, 0.5)",
                    "&:hover": {
                      borderColor: "#facc15",
                      backgroundColor: "rgba(250, 204, 21, 0.1)",
                    },
                  }}
                >
                  {platform}
                </Button>
              ))}
              {/* FIX 2: Added proper href to Button component */}
              <Button
                variant="contained"
                size="small"
                href="#"
                sx={{
                  backgroundColor: "#facc15 !important",
                  color: "#1f2937 !important",
                  "&:hover": { backgroundColor: "#e5b813 !important" },
                }}
              >
                Follow
              </Button>
            </Box>
          </Box>
        </motion.div>
      </motion.div>

      {/* Posts Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl"
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.7)",
          backdropFilter: "blur(10px)",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Typography
          variant="h5"
          className="font-semibold mb-8 text-center"
          sx={{
            color: "white",
            textShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.05em",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "3px",
              background:
                "linear-gradient(90deg, rgba(250,204,21,0.3) 0%, rgba(250,204,21,1) 50%, rgba(250,204,21,0.3) 100%)",
              borderRadius: "10px",
            },
          }}
        >
          {user.name || user.username}&apos;s Posts
        </Typography>
        {posts.length === 0 ? (
          <Typography
            className="text-gray-400 text-center"
            sx={{ color: "#9ca3af !important" }}
          >
            No posts yet.
          </Typography>
        ) : (
          posts.map((post) => (
            <motion.div key={post.id} variants={itemVariants}>
              <Card
                className="backdrop-blur-md rounded-2xl shadow-lg mb-6"
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "rgba(31, 41, 55, 0.85) !important",
                  color: "white",
                }}
              >
                <CardContent sx={{ backgroundColor: "transparent !important" }}>
                  <Typography
                    variant="h6"
                    className="text-white font-bold"
                    sx={{ color: "white !important" }}
                  >
                    {post.title}{" "}
                    <span
                      className="text-yellow-400 text-sm"
                      style={{ color: "#facc15" }}
                    >
                      ({post.type})
                    </span>
                  </Typography>
                  <Typography
                    className="text-gray-300 mt-1"
                    sx={{ color: "#d1d5db !important" }}
                  >
                    {post.description}
                  </Typography>
                  {post.images && post.images.length > 0 && (
                    <CardMedia
                      component="img"
                      image={post.images[0]}
                      alt={post.title}
                      sx={{
                        mt: 2,
                        borderRadius: "8px",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {post.type === "project" &&
                    "tags" in post &&
                    post.tags &&
                    post.tags.length > 0 && (
                      <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                        {post.tags.slice(0, 3).map((tag) => (
                          <Typography
                            key={tag}
                            className="text-xs bg-gray-700 rounded-full px-2 py-1"
                            sx={{ color: "#d1d5db !important" }}
                          >
                            {tag}
                          </Typography>
                        ))}
                        {post.tags.length > 3 && (
                          <Typography
                            className="text-xs bg-gray-700 rounded-full px-2 py-1"
                            sx={{ color: "#d1d5db !important" }}
                          >
                            +{post.tags.length - 3}
                          </Typography>
                        )}
                      </Box>
                    )}
                  {post.type === "event" && "date" in post && post.date && (
                    <Typography
                      className="text-gray-400 mt-2"
                      sx={{ color: "#9ca3af !important" }}
                    >
                      Date: {new Date(post.date).toLocaleDateString()}
                      {"location" in post &&
                        post.location &&
                        ` | Location: ${post.location}`}
                    </Typography>
                  )}
                  <Typography
                    className="text-gray-400 mt-2"
                    sx={{ color: "#9ca3af !important" }}
                  >
                    Posted {formatDate(post.createdAt)} | {post.commentCount}{" "}
                    comments
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{ p: 2, backgroundColor: "transparent !important" }}
                >
                  <Button
                    className="text-yellow-400 hover:text-yellow-300"
                    sx={{ color: "#facc15 !important" }}
                    endIcon={<ArrowForwardIcon sx={{ color: "#facc15" }} />}
                    component={Link}
                    href={`/${post.type}s/${post.id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </Box>
  );
}
