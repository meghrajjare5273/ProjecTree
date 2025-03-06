/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  Grid2,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  // InputBase,
  Paper,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fab,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  CalendarToday,
  LocationOn,
  Add,
  // Search,
  FilterList,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import type Post from "@/types/posts";
import type User from "@/types/users";
import { formatDistanceToNow } from "date-fns";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tabValue, setTabValue] = useState(0);
  // const [searchQuery, setSearchQuery] = useState("");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

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

  // Simulate saved and liked posts (would come from API in real app)
  useEffect(() => {
    // Simulated saved and liked posts
    const mockSaved = ["1", "3", "5"];
    const mockLiked = ["2", "4", "6"];
    setSavedPosts(mockSaved);
    setLikedPosts(mockLiked);
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle search
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Searching for:", searchQuery);
  // };

  // Toggle save post
  const handleSavePost = useCallback((postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

  // Toggle like post
  const handleLikePost = useCallback((postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

  // Combine and sort posts
  const allPosts = useMemo(() => {
    return (projectsData?.data || [])
      .map((p: any) => ({ ...p, type: "project" }))
      .concat(
        (eventsData?.data || []).map((e: any) => ({ ...e, type: "event" }))
      )
      .sort(
        (a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [projectsData, eventsData]);

  // Filtered posts based on tab
  const posts = useMemo(() => {
    if (tabValue === 0) return allPosts;
    if (tabValue === 1)
      return allPosts.filter((post: any) => post.type === "project");
    if (tabValue === 2)
      return allPosts.filter((post: any) => post.type === "event");
    if (tabValue === 3)
      return allPosts.filter((post: any) => savedPosts.includes(post.id));
    return allPosts;
  }, [allPosts, tabValue, savedPosts]);

  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Handle loading state
  const isLoading = !profileData || !projectsData || !eventsData;
  const mdSize = isMobile ? 12 : 6;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: "100vh" }}>
        <Grid2 container spacing={3}>
          {/* Left Sidebar - Profile Summary and Navigation */}
          {!isMobile && (
            <Grid2 size={{ xs: 12, md: 3 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    backgroundColor: "rgba(31, 41, 55, 0.85)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    position: "sticky",
                    top: "80px",
                  }}
                >
                  {isLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={80}
                        height={80}
                        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                      />
                      <Skeleton
                        variant="text"
                        width="80%"
                        height={20}
                        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                      />
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={16}
                        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                      />
                    </Box>
                  ) : user ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Link href={`/users/${user.username}`}>
                        <Avatar
                          src={user.image || ""}
                          alt={user.name || "User"}
                          sx={{
                            width: 80,
                            height: 80,
                            border: "3px solid #facc15",
                            boxShadow: "0 0 15px rgba(250, 204, 21, 0.3)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 0 20px rgba(250, 204, 21, 0.5)",
                            },
                          }}
                        />
                      </Link>
                      <Typography
                        variant="h6"
                        sx={{ color: "white", fontWeight: 600, mt: 1 }}
                      >
                        {user.name || "User"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                      >
                        @{user.username}
                      </Typography>

                      {user.bio && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            textAlign: "center",
                            mb: 2,
                          }}
                        >
                          {user.bio}
                        </Typography>
                      )}

                      <Divider
                        sx={{
                          width: "100%",
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          my: 1,
                        }}
                      />

                      <Button
                        component={Link}
                        href={`/users/${user.username}`}
                        variant="outlined"
                        fullWidth
                        sx={{
                          color: "#facc15",
                          borderColor: "#facc15",
                          borderRadius: "8px",
                          "&:hover": {
                            borderColor: "#facc15",
                            backgroundColor: "rgba(250, 204, 21, 0.1)",
                          },
                        }}
                      >
                        View Profile
                      </Button>
                    </Box>
                  ) : null}

                  <Divider
                    sx={{ my: 3, bgcolor: "rgba(255, 255, 255, 0.1)" }}
                  />

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {/* <Button
                      variant={tabValue === 0 ? "contained" : "text"}
                      fullWidth
                      startIcon={<Search />}
                      onClick={() => setTabValue(0)}
                      sx={{
                        justifyContent: "flex-start",
                        color: tabValue === 0 ? "black" : "white",
                        backgroundColor:
                          tabValue === 0 ? "#facc15" : "transparent",
                        "&:hover": {
                          backgroundColor:
                            tabValue === 0
                              ? "#facc15"
                              : "rgba(255, 255, 255, 0.05)",
                        },
                        borderRadius: "8px",
                        py: 1.5,
                      }}
                    >
                      All Posts
                    </Button> */}

                    <Button
                      variant={tabValue === 1 ? "contained" : "text"}
                      fullWidth
                      startIcon={<FilterList />}
                      onClick={() => setTabValue(1)}
                      sx={{
                        justifyContent: "flex-start",
                        color: tabValue === 1 ? "black" : "white",
                        backgroundColor:
                          tabValue === 1 ? "#facc15" : "transparent",
                        "&:hover": {
                          backgroundColor:
                            tabValue === 1
                              ? "#facc15"
                              : "rgba(255, 255, 255, 0.05)",
                        },
                        borderRadius: "8px",
                        py: 1.5,
                      }}
                    >
                      Projects
                    </Button>

                    <Button
                      variant={tabValue === 2 ? "contained" : "text"}
                      fullWidth
                      startIcon={<CalendarToday />}
                      onClick={() => setTabValue(2)}
                      sx={{
                        justifyContent: "flex-start",
                        color: tabValue === 2 ? "black" : "white",
                        backgroundColor:
                          tabValue === 2 ? "#facc15" : "transparent",
                        "&:hover": {
                          backgroundColor:
                            tabValue === 2
                              ? "#facc15"
                              : "rgba(255, 255, 255, 0.05)",
                        },
                        borderRadius: "8px",
                        py: 1.5,
                      }}
                    >
                      Events
                    </Button>

                    <Button
                      variant={tabValue === 3 ? "contained" : "text"}
                      fullWidth
                      startIcon={<Bookmark />}
                      onClick={() => setTabValue(3)}
                      sx={{
                        justifyContent: "flex-start",
                        color: tabValue === 3 ? "black" : "white",
                        backgroundColor:
                          tabValue === 3 ? "#facc15" : "transparent",
                        "&:hover": {
                          backgroundColor:
                            tabValue === 3
                              ? "#facc15"
                              : "rgba(255, 255, 255, 0.05)",
                        },
                        borderRadius: "8px",
                        py: 1.5,
                      }}
                    >
                      Saved
                    </Button>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Add />}
                      sx={{
                        backgroundColor: "#facc15",
                        color: "black",
                        fontWeight: 600,
                        borderRadius: "8px",
                        py: 1.5,
                        "&:hover": {
                          backgroundColor: "#e2b714",
                        },
                      }}
                    >
                      Create Post
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid2>
          )}

          {/* Main Content - Posts */}
          <Grid2 size={{ xs: 12, md: mdSize }}>
            <Box>
              {/* Mobile Search & Tabs */}
              {/* {isMobile && (
                <Paper
                  elevation={0}
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "24px",
                    mb: 2,
                    backgroundColor: "rgba(31, 41, 55, 0.85)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <IconButton sx={{ p: "10px", color: "white" }}>
                    <Search />
                  </IconButton>
                  <InputBase
                    sx={{ ml: 1, flex: 1, color: "white" }}
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Paper>
              )} */}

              {isMobile && (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: "12px",
                    backgroundColor: "rgba(31, 41, 55, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="inherit"
                    sx={{
                      ".MuiTabs-indicator": {
                        backgroundColor: "#facc15",
                      },
                    }}
                  >
                    <Tab
                      label="All"
                      sx={{
                        color: "white",
                        opacity: tabValue === 0 ? 1 : 0.7,
                        fontWeight: tabValue === 0 ? 600 : 400,
                      }}
                    />
                    <Tab
                      label="Projects"
                      sx={{
                        color: "white",
                        opacity: tabValue === 1 ? 1 : 0.7,
                        fontWeight: tabValue === 1 ? 600 : 400,
                      }}
                    />
                    <Tab
                      label="Events"
                      sx={{
                        color: "white",
                        opacity: tabValue === 2 ? 1 : 0.7,
                        fontWeight: tabValue === 2 ? 600 : 400,
                      }}
                    />
                    <Tab
                      label="Saved"
                      sx={{
                        color: "white",
                        opacity: tabValue === 3 ? 1 : 0.7,
                        fontWeight: tabValue === 3 ? 600 : 400,
                      }}
                    />
                  </Tabs>
                </Paper>
              )}

              {/* Desktop Section Title */}
              {!isMobile && (
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      position: "relative",
                      display: "inline-block",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-8px",
                        left: 0,
                        width: "40px",
                        height: "3px",
                        background: "#facc15",
                        borderRadius: "10px",
                      },
                    }}
                  >
                    {tabValue === 0 && "Latest Posts"}
                    {tabValue === 1 && "Projects"}
                    {tabValue === 2 && "Events"}
                    {tabValue === 3 && "Saved Posts"}
                  </Typography>

                  {/* <Paper
                    elevation={0}
                    component="form"
                    onSubmit={handleSearch}
                    sx={{
                      p: "2px 12px",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "24px",
                      backgroundColor: "rgba(31, 41, 55, 0.85)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      width: "250px",
                    }}
                  >
                    <InputBase
                      sx={{ flex: 1, color: "white", fontSize: "0.875rem" }}
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <IconButton type="submit" sx={{ p: "6px", color: "white" }}>
                      <Search sx={{ fontSize: "1.125rem" }} />
                    </IconButton>
                  </Paper> */}
                </Box>
              )}

              {/* Posts List */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {[1, 2, 3].map((index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          mb: 3,
                          borderRadius: "16px",
                          backgroundColor: "rgba(31, 41, 55, 0.85)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Skeleton
                              variant="circular"
                              width={40}
                              height={40}
                              sx={{
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                                mr: 2,
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton
                                variant="text"
                                width={120}
                                height={24}
                                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                              />
                              <Skeleton
                                variant="text"
                                width={80}
                                height={16}
                                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                              />
                            </Box>
                            <Skeleton
                              variant="rounded"
                              width={60}
                              height={24}
                              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                            />
                          </Box>
                          <Skeleton
                            variant="text"
                            height={32}
                            width="70%"
                            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 1 }}
                          />
                          <Skeleton
                            variant="text"
                            height={20}
                            width="100%"
                            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 1 }}
                          />
                          <Skeleton
                            variant="text"
                            height={20}
                            width="90%"
                            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 2 }}
                          />
                          <Skeleton
                            variant="rectangular"
                            height={200}
                            sx={{
                              bgcolor: "rgba(255, 255, 255, 0.1)",
                              borderRadius: 2,
                            }}
                          />
                        </Box>
                        <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />
                        <Box
                          sx={{
                            p: 2,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Skeleton
                              variant="circular"
                              width={36}
                              height={36}
                              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                            />
                            <Skeleton
                              variant="circular"
                              width={36}
                              height={36}
                              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                            />
                          </Box>
                          <Skeleton
                            variant="rounded"
                            width={100}
                            height={36}
                            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </motion.div>
                ) : profileError || projectsError || eventsError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: "16px",
                        backgroundColor: "rgba(31, 41, 55, 0.85)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "#ef4444", mb: 2 }}>
                        Error Loading Data
                      </Typography>
                      <Typography
                        sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}
                      >
                        There was a problem fetching the latest posts. Please
                        try again later.
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{
                          color: "#facc15",
                          borderColor: "#facc15",
                          "&:hover": {
                            borderColor: "#facc15",
                            backgroundColor: "rgba(250, 204, 21, 0.1)",
                          },
                        }}
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </Paper>
                  </motion.div>
                ) : posts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: "16px",
                        backgroundColor: "rgba(31, 41, 55, 0.85)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                        No posts found
                      </Typography>
                      <Typography
                        sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}
                      >
                        {tabValue === 3
                          ? "You haven't saved any posts yet."
                          : "No posts available in this category."}
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#facc15",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "#e2b714",
                          },
                        }}
                      >
                        Create Post
                      </Button>
                    </Paper>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {posts.map((post: any) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        <Card
                          elevation={0}
                          sx={{
                            mb: 3,
                            borderRadius: "16px",
                            backgroundColor: "rgba(31, 41, 55, 0.85)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-5px)",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                            },
                          }}
                        >
                          <CardContent sx={{ pt: 3, pb: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Link href={`/users/${post.user.username}`}>
                                <Avatar
                                  src={post.user.image || ""}
                                  alt={post.user.username}
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    border: "2px solid #facc15",
                                    mr: 2,
                                    transition: "transform 0.2s ease",
                                    "&:hover": {
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                />
                              </Link>
                              <Box sx={{ flex: 1 }}>
                                <Link
                                  href={`/users/${post.user.username}`}
                                  style={{
                                    textDecoration: "none",
                                    color: "white",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontWeight: 600,
                                      color: "white",
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
                                  {formatDate(post.createdAt)}
                                </Typography>
                              </Box>
                              <Chip
                                label={post.type}
                                size="small"
                                sx={{
                                  backgroundColor: "#facc15",
                                  color: "#111827",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              />
                            </Box>

                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: "white",
                                lineHeight: 1.3,
                              }}
                            >
                              {post.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                color: "rgba(255,255,255,0.8)",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.6,
                              }}
                            >
                              {post.description}
                            </Typography>

                            {post.images && post.images.length > 0 && (
                              <Box
                                sx={{
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  mb: 2,
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  image={post.images[0]}
                                  alt={post.title}
                                  sx={{
                                    height: 240,
                                    objectFit: "cover",
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                      transform: "scale(1.02)",
                                    },
                                  }}
                                />
                              </Box>
                            )}

                            {post.type === "event" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 3,
                                  flexWrap: "wrap",
                                  mt: 2,
                                  mb: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: "rgba(255,255,255,0.7)",
                                  }}
                                >
                                  <CalendarToday
                                    fontSize="small"
                                    sx={{
                                      color: "#facc15",
                                      mr: 1,
                                      fontSize: "1rem",
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {new Date(post.date).toLocaleDateString(
                                      undefined,
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </Typography>
                                </Box>

                                {post.location && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      color: "rgba(255,255,255,0.7)",
                                    }}
                                  >
                                    <LocationOn
                                      fontSize="small"
                                      sx={{
                                        color: "#facc15",
                                        mr: 1,
                                        fontSize: "1rem",
                                      }}
                                    />
                                    <Typography variant="body2">
                                      {post.location}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )}

                            {post.type === "project" &&
                              post.tags &&
                              post.tags.length > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    mt: 2,
                                    mb: 1,
                                  }}
                                >
                                  {post.tags.map((tag: string) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          "rgba(250, 204, 21, 0.15)",
                                        color: "#facc15",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                          </CardContent>

                          <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                          <CardActions
                            sx={{
                              px: 3,
                              py: 1.5,
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Tooltip
                                title={
                                  likedPosts.includes(post.id)
                                    ? "Unlike"
                                    : "Like"
                                }
                              >
                                <IconButton
                                  onClick={() => handleLikePost(post.id)}
                                  sx={{
                                    color: likedPosts.includes(post.id)
                                      ? "#facc15"
                                      : "rgba(255,255,255,0.7)",
                                  }}
                                >
                                  {likedPosts.includes(post.id) ? (
                                    <Favorite fontSize="small" />
                                  ) : (
                                    <FavoriteBorder fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Comment">
                                <IconButton
                                  sx={{ color: "rgba(255,255,255,0.7)" }}
                                  onClick={() =>
                                    handleClick(post.type, post.id)
                                  }
                                >
                                  <Comment fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Share">
                                <IconButton
                                  sx={{ color: "rgba(255,255,255,0.7)" }}
                                >
                                  <Share fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Tooltip
                                title={
                                  savedPosts.includes(post.id)
                                    ? "Unsave"
                                    : "Save"
                                }
                              >
                                <IconButton
                                  onClick={() => handleSavePost(post.id)}
                                  sx={{
                                    color: savedPosts.includes(post.id)
                                      ? "#facc15"
                                      : "rgba(255,255,255,0.7)",
                                  }}
                                >
                                  {savedPosts.includes(post.id) ? (
                                    <Bookmark fontSize="small" />
                                  ) : (
                                    <BookmarkBorder fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleClick(post.type, post.id)}
                                sx={{
                                  ml: 1,
                                  color: "white",
                                  borderColor: "rgba(255,255,255,0.3)",
                                  "&:hover": {
                                    borderColor: "#facc15",
                                    color: "#facc15",
                                    backgroundColor: "rgba(250, 204, 21, 0.1)",
                                  },
                                }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardActions>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Create Post FAB */}
              {isMobile && (
                <Fab
                  color="primary"
                  aria-label="create post"
                  sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    backgroundColor: "#facc15",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "#e2b714",
                    },
                  }}
                >
                  <Add />
                </Fab>
              )}
            </Box>
          </Grid2>

          {/* Right Sidebar - Trending/Recent */}
          {!isTablet && (
            <Grid2 size={{ xs: 12, md: 3 }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    backgroundColor: "rgba(31, 41, 55, 0.85)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    position: "sticky",
                    top: "80px",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      mb: 2,
                      position: "relative",
                      display: "inline-block",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-8px",
                        left: 0,
                        width: "30px",
                        height: "2px",
                        background: "#facc15",
                        borderRadius: "10px",
                      },
                    }}
                  >
                    Trending Events
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    {isLoading ? (
                      <>
                        {[1, 2, 3].map((index) => (
                          <Box
                            key={index}
                            sx={{ mb: 2.5, display: "flex", gap: 2 }}
                          >
                            <Skeleton
                              variant="rectangular"
                              width={60}
                              height={60}
                              sx={{
                                borderRadius: 1,
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton
                                variant="text"
                                height={20}
                                width="90%"
                                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                              />
                              <Skeleton
                                variant="text"
                                height={16}
                                width="60%"
                                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </>
                    ) : (
                      eventsData?.data?.slice(0, 3).map((event: any) => (
                        <Box
                          key={event.id}
                          sx={{
                            mb: 2.5,
                            display: "flex",
                            gap: 2,
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                            "&:hover": {
                              transform: "translateX(5px)",
                            },
                          }}
                          onClick={() => handleClick("event", event.id)}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {event.images && event.images.length > 0 ? (
                              <Image
                                src={event.images[0] || "/placeholder.svg"}
                                alt={event.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "rgba(250, 204, 21, 0.2)",
                                  color: "#facc15",
                                }}
                              >
                                <CalendarToday fontSize="small" />
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: "white",
                                lineHeight: 1.3,
                              }}
                            >
                              {event.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {new Date(event.date).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                              {event.location && ` • ${event.location}`}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    backgroundColor: "rgba(31, 41, 55, 0.85)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      mb: 2,
                      position: "relative",
                      display: "inline-block",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-8px",
                        left: 0,
                        width: "30px",
                        height: "2px",
                        background: "#facc15",
                        borderRadius: "10px",
                      },
                    }}
                  >
                    Popular Tags
                  </Typography>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {isLoading ? (
                      <>
                        {[1, 2, 3, 4, 5, 6].map((index) => (
                          <Skeleton
                            key={index}
                            variant="rounded"
                            width={80}
                            height={32}
                            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                          />
                        ))}
                      </>
                    ) : (
                      [
                        "hackathon",
                        "javascript",
                        "design",
                        "AI",
                        "mobile",
                        "web",
                        "python",
                        "react",
                        "marketing",
                        "blockchain",
                      ].map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          clickable
                          sx={{
                            backgroundColor: "rgba(31, 41, 55, 0.6)",
                            color: "white",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            "&:hover": {
                              backgroundColor: "rgba(250, 204, 21, 0.2)",
                              color: "#facc15",
                              borderColor: "rgba(250, 204, 21, 0.5)",
                            },
                          }}
                        />
                      ))
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid2>
          )}
        </Grid2>
      </Box>
    </Container>
  );
}
