/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import Post from "@/types/posts";
import User from "@/types/users";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Memoized PostCard Component
// eslint-disable-next-line react/display-name
const PostCard = memo(
  ({
    post,
    onClick,
  }: {
    post: Post;
    onClick: (type: string, id: string) => void;
  }) => (
    <motion.div variants={itemVariants}>
      <Card
        className="backdrop-blur-md rounded-2xl shadow-lg mb-6"
        sx={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backgroundColor: "rgba(31, 41, 55, 0.85) !important",
          color: "white",
        }}
      >
        <CardContent sx={{ backgroundColor: "transparent !important" }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src={post.user.image || ""}
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                border: "1px solid #facc15",
              }}
            />
            <Link href={`users/${post.user.username}`}>
              <Typography
                className="text-white font-medium"
                sx={{ color: "white !important" }}
              >
                {post.user.username}
              </Typography>
            </Link>
          </Box>
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
          {post.type === "event" && (
            <Typography
              className="text-gray-400 mt-2"
              sx={{ color: "#9ca3af !important" }}
            >
              Date: {new Date(post.date).toLocaleDateString()}
              {post.location && ` | Location: ${post.location}`}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ p: 2, backgroundColor: "transparent !important" }}>
          <Button
            className="text-yellow-400 hover:text-yellow-300"
            sx={{ color: "#facc15 !important" }}
            endIcon={<ArrowForwardIcon sx={{ color: "#facc15" }} />}
            onClick={() => onClick(post.type, post.id)}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  )
);

export default function Dashboard() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);

  // Memoized navigation handler
  const handleClick = useCallback(
    (type: string, id: string) => {
      router.push(`/${type}s/${id}`);
    },
    [router]
  );

  // Fetch data using SWR
  const { data: profileData, error: profileError } = useSWR(
    "/api/profile",
    fetcher
  );
  const { data: projectsData, error: projectsError } = useSWR(
    "/api/projects",
    fetcher
  );
  const { data: eventsData, error: eventsError } = useSWR(
    "/api/events",
    fetcher
  );

  // Check session and redirect if not authenticated
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.push("/auth?mode=signin");
      }
    };
    checkSession();
  }, [router]);

  // Set user data when profile data is available
  useEffect(() => {
    if (profileData) {
      setUser(profileData.user);
    }
  }, [profileData]);

  // Combine and sort posts
  const posts = (projectsData?.data || [])
    .map((p: any) => ({ ...p, type: "project" }))
    .concat((eventsData?.data || []).map((e: any) => ({ ...e, type: "event" })))
    .sort(
      (a: Post, b: Post) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Handle loading state
  const isLoading = !profileData || !projectsData || !eventsData;

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Typography className="text-white">Loading...</Typography>
      </motion.div>
    );
  }

  // Handle error state
  if (profileError || projectsError || eventsError) {
    return <Typography className="text-red-500">Error loading data</Typography>;
  }

  return (
    <Box
      className="relative z-10 flex flex-col items-center min-h-screen pt-20 pb-10"
      sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, md: 4 } }}
    >
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
          Community Posts
        </Typography>
        {posts.length === 0 ? (
          <Typography className="text-gray-400 text-center">
            No posts yet. Be the first to share something!
          </Typography>
        ) : (
          posts.map((post: Post) => (
            <PostCard key={post.id} post={post} onClick={handleClick} />
          ))
        )}
      </motion.div>
    </Box>
  );
}
