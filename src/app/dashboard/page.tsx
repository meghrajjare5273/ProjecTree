/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Chip,
  Container,
  Skeleton,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import type Post from "@/types/posts";
import type User from "@/types/users";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

// Loading Skeleton Component
const PostSkeleton = () => (
  <Card
    sx={{
      backgroundColor: "rgba(31, 41, 55, 0.85)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      mb: 3,
      overflow: "hidden",
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mr: 2 }}
        />
        <Skeleton
          variant="text"
          width={120}
          sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
        />
      </Box>
      <Skeleton
        variant="text"
        width="80%"
        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 1 }}
      />
      <Skeleton
        variant="text"
        width="100%"
        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 1 }}
      />
      <Skeleton
        variant="text"
        width="60%"
        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 2 }}
      />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={140}
        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 2 }}
      />
    </CardContent>
    <CardActions sx={{ p: 2 }}>
      <Skeleton
        variant="rectangular"
        width={120}
        height={36}
        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 1 }}
      />
    </CardActions>
  </Card>
);

// Memoized PostCard Component with enhanced styling
// eslint-disable-next-line react/display-name
const PostCard = memo(
  ({
    post,
    onClick,
  }: {
    post: Post;
    onClick: (type: string, id: string) => void;
  }) => (
    <motion.div variants={itemVariants} whileHover="hover" layout>
      <Card
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "rgba(31, 41, 55, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
          mb: 3,
          color: "white",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            zIndex: 0,
            pointerEvents: "none",
          },
          "&:hover::before": {
            opacity: 1,
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src={post.user.image || ""}
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                border: "2px solid #facc15",
                boxShadow: "0 0 10px rgba(250, 204, 21, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 0 15px rgba(250, 204, 21, 0.5)",
                },
              }}
            />
            <Box>
              <Link
                href={`users/${post.user.username}`}
                style={{ textDecoration: "none" }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    transition: "color 0.2s ease",
                    "&:hover": {
                      color: "#facc15",
                    },
                  }}
                >
                  {post.user.username}
                </Typography>
              </Link>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </Box>
            <Chip
              label={post.type}
              size="small"
              sx={{
                ml: "auto",
                backgroundColor: "#facc15",
                color: "#111827",
                fontWeight: 600,
                textTransform: "capitalize",
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 700,
              mb: 1,
              fontSize: "1.25rem",
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              mb: 2,
            }}
          >
            {post.description}
          </Typography>

          {post.images && post.images.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CardMedia
                component="img"
                image={post.images[0]}
                alt={post.title}
                sx={{
                  borderRadius: "12px",
                  maxHeight: "220px",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
            </motion.div>
          )}

          {post.type === "event" && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarTodayIcon
                  sx={{ fontSize: "0.9rem", color: "#facc15", mr: 0.5 }}
                />
                <Typography
                  sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}
                >
                  {new Date(post.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>

              {post.location && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOnIcon
                    sx={{ fontSize: "0.9rem", color: "#facc15", mr: 0.5 }}
                  />
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}
                  >
                    {post.location}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        <CardActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Box>
            <Tooltip title="Like">
              <IconButton
                size="small"
                sx={{ color: "rgba(255,255,255,0.7)", mr: 1 }}
              >
                <FavoriteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => onClick(post.type, post.id)}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: "rgba(250, 204, 21, 0.9)",
                color: "#111827",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                "&:hover": {
                  backgroundColor: "#facc15",
                  boxShadow: "0 0 15px rgba(250, 204, 21, 0.4)",
                },
              }}
            >
              View Details
            </Button>
          </motion.div>
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        className="relative z-10"
        sx={{
          minHeight: "100vh",
          pt: { xs: 2, md: 4 },
          pb: 8,
        }}
      >
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ maxWidth: "800px", mx: "auto" }}>
              <Box
                sx={{
                  textAlign: "center",
                  mb: 6,
                  position: "relative",
                }}
              >
                <Skeleton
                  variant="text"
                  width={240}
                  height={40}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    mx: "auto",
                    borderRadius: 2,
                  }}
                />
                <Skeleton
                  variant="text"
                  width={120}
                  height={6}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    mx: "auto",
                    mt: 2,
                    borderRadius: 1,
                  }}
                />
              </Box>

              {[1, 2, 3].map((i) => (
                <PostSkeleton key={i} />
              ))}
            </Box>
          </motion.div>
        ) : profileError || projectsError || eventsError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-8 rounded-xl"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              maxWidth: "600px",
              margin: "100px auto",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#ef4444",
                mb: 2,
                fontWeight: 600,
              }}
            >
              Error Loading Data
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}
            >
              There was a problem fetching the latest posts. Please try again
              later.
            </Typography>
            <Button
              variant="outlined"
              sx={{
                mt: 3,
                color: "#ef4444",
                borderColor: "#ef4444",
                "&:hover": {
                  borderColor: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                },
              }}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  mb: { xs: 4, md: 6 },
                  position: "relative",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
                      letterSpacing: "0.05em",
                      mb: 1,
                      position: "relative",
                      display: "inline-block",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "80px",
                        height: "3px",
                        background:
                          "linear-gradient(90deg, rgba(250,204,21,0.3) 0%, rgba(250,204,21,1) 50%, rgba(250,204,21,0.3) 100%)",
                        borderRadius: "10px",
                      },
                    }}
                  >
                    Community Posts
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      mt: 3,
                      fontWeight: 400,
                      fontSize: "0.95rem",
                    }}
                  >
                    Discover the latest projects and events from our community
                  </Typography>
                </motion.div>
              </Box>

              {posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center p-8 rounded-xl"
                  style={{
                    backgroundColor: "rgba(31, 41, 55, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      textAlign: "center",
                      mb: 3,
                    }}
                  >
                    No posts yet. Be the first to share something!
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#facc15",
                      color: "#111827",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "#eab308",
                      },
                    }}
                  >
                    Create Post
                  </Button>
                </motion.div>
              ) : (
                posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} onClick={handleClick} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </Box>
    </Container>
  );
}
