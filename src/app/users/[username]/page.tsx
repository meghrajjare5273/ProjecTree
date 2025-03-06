/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  Favorite,
  FavoriteBorder,
  Comment,
  CalendarToday,
  LocationOn,
  GitHub,
  LinkedIn,
  Twitter,
  Language,
  MoreVert,
  Message,
  PersonAdd,
  PersonAddDisabled,
  Flag,
  BookmarkAdd,
  Bookmark,
} from "@mui/icons-material"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

// Types
type ProfileUser = {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  socialLinks: Record<string, string>
  createdAt: string
}

type ExtendedPost = {
  id: string
  title: string
  description: string
  type: "project" | "event"
  images?: string[]
  tags?: string[]
  date?: string
  location?: string
  createdAt: string
  commentCount: number
}

type ProfileData = {
  user: ProfileUser
  posts: ExtendedPost[]
}

// Fetcher function
const fetchProfileData = async (username: string): Promise<ProfileData> => {
  const response = await fetch(`/api/users/${username}`, {
    credentials: "include",
  })
  if (!response.ok) {
    throw new Error("Failed to fetch profile data")
  }
  return response.json()
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.5,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
  hover: {
    y: -8,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
}

export default function UserProfilePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const router = useRouter()
  const params = useParams()
  const username = params.username as string

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [following, setFollowing] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [savedPosts, setSavedPosts] = useState<string[]>([])
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  // Fetch profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await fetchProfileData(username)
        setProfileData(data)
        setLoading(false)
      } catch (err) {
        setError("User not found or an error occurred")
        console.log(err)
        setLoading(false)
      }
    }
    loadProfileData()
  }, [username])

  // Simulate saved and liked posts (would come from API in real app)
  useEffect(() => {
    // Simulated saved and liked posts
    const mockSaved = ["1", "3", "5"]
    const mockLiked = ["2", "4", "6"]
    setSavedPosts(mockSaved)
    setLikedPosts(mockLiked)
  }, [])

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Toggle save post
  const handleSavePost = (postId: string) => {
    setSavedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  // Toggle like post
  const handleLikePost = (postId: string) => {
    setLikedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  // Toggle following
  const handleFollowToggle = () => {
    setFollowing(!following)
  }

  // Get social icon by platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <GitHub />
      case "linkedin":
        return <LinkedIn />
      case "twitter":
        return <Twitter />
      default:
        return <Language />
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  // Filter posts based on tab
  const filteredPosts = useMemo(() => {
    if (!profileData) return []

    if (tabValue === 0) return profileData.posts
    if (tabValue === 1) return profileData.posts.filter((post) => post.type === "project")
    if (tabValue === 2) return profileData.posts.filter((post) => post.type === "event")
    return profileData.posts
  }, [profileData, tabValue])

  // Stats data
  const stats = useMemo(() => {
    if (!profileData) return { projects: 0, events: 0, total: 0 }

    const projects = profileData.posts.filter((post) => post.type === "project").length
    const events = profileData.posts.filter((post) => post.type === "event").length

    return {
      projects,
      events,
      total: projects + events,
    }
  }, [profileData])

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingProfileSkeleton isMobile={isMobile} />
        ) : error || !profileData ? (
          <ErrorDisplay error={error} />
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Profile Header Card */}
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  mb: 4,
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "relative",
                }}
              >
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100%",
                    height: "100%",
                    backgroundImage: "radial-gradient(circle at 90% 10%, rgba(250, 204, 21, 0.1) 0%, transparent 60%)",
                    opacity: 0.6,
                    zIndex: 0,
                  }}
                />

                <Grid container spacing={0} sx={{ position: "relative", zIndex: 1 }}>
                  {/* Left column: Avatar and social links */}
                  <Grid
                    item
                    xs={12}
                    md={4}
                    sx={{
                      p: { xs: 3, md: 4 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: { xs: "center", md: "center" },
                      justifyContent: "center",
                      borderRight: { md: "1px solid rgba(255, 255, 255, 0.1)" },
                      borderBottom: { xs: "1px solid rgba(255, 255, 255, 0.1)", md: "none" },
                    }}
                  >
                    <Avatar
                      src={profileData.user.image || ""}
                      alt={profileData.user.name || profileData.user.username}
                      sx={{
                        width: { xs: 100, md: 160 },
                        height: { xs: 100, md: 160 },
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        border: "4px solid rgba(250, 204, 21, 0.6)",
                        mb: 2,
                      }}
                    />

                    <Typography
                      variant="h5"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        textAlign: "center",
                        mb: 0.5,
                      }}
                    >
                      {profileData.user.name || profileData.user.username}
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#facc15",
                        fontWeight: 600,
                        textAlign: "center",
                        mb: 2,
                      }}
                    >
                      @{profileData.user.username}
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                      {Object.entries(profileData.user.socialLinks).map(([platform, url]) => (
                        <Tooltip key={platform} title={platform} arrow>
                          <IconButton
                            onClick={() => window.open(url, "_blank")}
                            sx={{
                              color: "white",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              "&:hover": {
                                backgroundColor: "#facc15",
                                color: "#111827",
                                transform: "translateY(-3px)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            {getSocialIcon(platform)}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Stack>

                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        justifyContent: "center",
                        width: "100%",
                        mt: 1,
                      }}
                    >
                      <Button
                        variant={following ? "outlined" : "contained"}
                        startIcon={following ? <PersonAddDisabled /> : <PersonAdd />}
                        onClick={handleFollowToggle}
                        sx={{
                          backgroundColor: following ? "transparent" : "#facc15",
                          color: following ? "#facc15" : "black",
                          borderColor: following ? "#facc15" : "transparent",
                          fontWeight: 600,
                          borderRadius: "8px",
                          px: 3,
                          py: 1,
                          "&:hover": {
                            backgroundColor: following ? "rgba(250, 204, 21, 0.1)" : "#e2b714",
                            borderColor: following ? "#facc15" : "transparent",
                          },
                        }}
                      >
                        {following ? "Unfollow" : "Follow"}
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<Message />}
                        sx={{
                          ml: 2,
                          color: "white",
                          borderColor: "rgba(255, 255, 255, 0.3)",
                          "&:hover": {
                            borderColor: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          borderRadius: "8px",
                        }}
                      >
                        Message
                      </Button>

                      <IconButton
                        onClick={handleMenuOpen}
                        sx={{
                          ml: 1,
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                        }}
                      >
                        <MoreVert />
                      </IconButton>

                      <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                          sx: {
                            mt: 1.5,
                            backgroundColor: "rgb(31, 41, 55)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                          },
                        }}
                      >
                        <MenuItem onClick={handleMenuClose}>
                          <ListItemIcon sx={{ color: "#facc15" }}>
                            <BookmarkAdd fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ sx: { color: "white" } }}>Save Profile</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                          <ListItemIcon sx={{ color: "#ef4444" }}>
                            <Flag fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ sx: { color: "white" } }}>Report User</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Grid>

                  {/* Right column: Bio, stats */}
                  <Grid item xs={12} md={8} sx={{ p: { xs: 3, md: 4 } }}>
                    {/* Mobile action buttons */}
                    <Box
                      sx={{
                        display: { xs: "flex", md: "none" },
                        justifyContent: "center",
                        width: "100%",
                        mb: 3,
                        gap: 2,
                      }}
                    >
                      <Button
                        variant={following ? "outlined" : "contained"}
                        startIcon={following ? <PersonAddDisabled /> : <PersonAdd />}
                        onClick={handleFollowToggle}
                        fullWidth
                        sx={{
                          backgroundColor: following ? "transparent" : "#facc15",
                          color: following ? "#facc15" : "black",
                          borderColor: following ? "#facc15" : "transparent",
                          fontWeight: 600,
                          borderRadius: "8px",
                          "&:hover": {
                            backgroundColor: following ? "rgba(250, 204, 21, 0.1)" : "#e2b714",
                            borderColor: following ? "#facc15" : "transparent",
                          },
                        }}
                      >
                        {following ? "Unfollow" : "Follow"}
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<Message />}
                        fullWidth
                        sx={{
                          color: "white",
                          borderColor: "rgba(255, 255, 255, 0.3)",
                          "&:hover": {
                            borderColor: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          borderRadius: "8px",
                        }}
                      >
                        Message
                      </Button>
                    </Box>

                    {/* Bio */}
                    {profileData.user.bio && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            lineHeight: 1.6,
                            fontSize: "1rem",
                          }}
                        >
                          {profileData.user.bio}
                        </Typography>
                      </Box>
                    )}

                    {/* Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: "#facc15",
                              mb: 0.5,
                            }}
                          >
                            {stats.total}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontWeight: 500,
                            }}
                          >
                            Posts
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: "#facc15",
                              mb: 0.5,
                            }}
                          >
                            {stats.projects}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontWeight: 500,
                            }}
                          >
                            Projects
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: "#facc15",
                              mb: 0.5,
                            }}
                          >
                            {stats.events}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontWeight: 500,
                            }}
                          >
                            Events
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* About / Join Date */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "rgba(255, 255, 255, 0.7)",
                          mb: 1,
                        }}
                      >
                        <CalendarToday fontSize="small" sx={{ mr: 1, color: "#facc15", fontSize: "1rem" }} />
                        Joined{" "}
                        {new Date(profileData.user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            {/* Content Tabs */}
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "rgba(31, 41, 55, 0.85)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  mb: 4,
                  overflow: "hidden",
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : undefined}
                  sx={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    ".MuiTabs-indicator": {
                      backgroundColor: "#facc15",
                    },
                  }}
                >
                  <Tab
                    label={`All Posts (${profileData.posts.length})`}
                    sx={{
                      color: "white",
                      fontWeight: tabValue === 0 ? 600 : 400,
                      opacity: tabValue === 0 ? 1 : 0.7,
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                  <Tab
                    label={`Projects (${stats.projects})`}
                    sx={{
                      color: "white",
                      fontWeight: tabValue === 1 ? 600 : 400,
                      opacity: tabValue === 1 ? 1 : 0.7,
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                  <Tab
                    label={`Events (${stats.events})`}
                    sx={{
                      color: "white",
                      fontWeight: tabValue === 2 ? 600 : 400,
                      opacity: tabValue === 2 ? 1 : 0.7,
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                </Tabs>
              </Paper>
            </motion.div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <motion.div variants={itemVariants}>
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
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                    {profileData.user.username} hasn&apos;t posted any{" "}
                    {tabValue === 1 ? "projects" : tabValue === 2 ? "events" : "content"} yet.
                  </Typography>
                </Paper>
              </motion.div>
            ) : (
              <Grid container spacing={3}>
                {filteredPosts.map((post) => (
                  <Grid item xs={12} md={6} lg={4} key={post.id}>
                    <motion.div variants={cardVariants} whileHover="hover" layout>
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          borderRadius: "16px",
                          backgroundColor: "rgba(31, 41, 55, 0.85)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Card Media */}
                        {post.images && post.images.length > 0 ? (
                          <CardMedia
                            component="img"
                            height={180}
                            image={post.images[0]}
                            alt={post.title}
                            sx={{
                              objectFit: "cover",
                              transition: "transform 0.5s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 140,
                              background:
                                post.type === "project"
                                  ? "linear-gradient(135deg, rgba(250, 204, 21, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)"
                                  : "linear-gradient(135deg, rgba(250, 204, 21, 0.3) 0%, rgba(251, 191, 36, 0.3) 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#facc15" }}>
                              {post.type === "project" ? "Project" : "Event"}
                            </Typography>
                          </Box>
                        )}

                        {/* Card Content */}
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="h2"
                                sx={{
                                  fontWeight: 700,
                                  color: "white",
                                  lineHeight: 1.3,
                                }}
                              >
                                {post.title}
                              </Typography>
                              <Chip
                                label={post.type}
                                size="small"
                                sx={{
                                  ml: 1,
                                  backgroundColor: "#facc15",
                                  color: "#111827",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              />
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255,255,255,0.8)",
                                mb: 2,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.6,
                              }}
                            >
                              {post.description}
                            </Typography>
                          </Box>

                          {/* Tags (for projects) */}
                          {post.type === "project" && post.tags && post.tags.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mb: 1,
                              }}
                            >
                              {post.tags.slice(0, 3).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "4px",
                                    height: "22px",
                                    fontSize: "0.7rem",
                                  }}
                                />
                              ))}
                              {post.tags.length > 3 && (
                                <Chip
                                  label={`+${post.tags.length - 3}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "rgba(250, 204, 21, 0.2)",
                                    color: "#facc15",
                                    borderRadius: "4px",
                                    height: "22px",
                                    fontSize: "0.7rem",
                                  }}
                                />
                              )}
                            </Box>
                          )}

                          {/* Event details */}
                          {post.type === "event" && post.date && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
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
                                    fontSize: "0.85rem",
                                  }}
                                />
                                <Typography variant="body2">
                                  {new Date(post.date).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
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
                                      fontSize: "0.85rem",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {post.location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>

                        <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />

                        {/* Card Actions */}
                        <CardActions
                          sx={{
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.5,
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleLikePost(post.id)}
                              sx={{
                                color: likedPosts.includes(post.id) ? "#facc15" : "rgba(255,255,255,0.7)",
                              }}
                            >
                              {likedPosts.includes(post.id) ? (
                                <Favorite fontSize="small" />
                              ) : (
                                <FavoriteBorder fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
                              <Comment fontSize="small" />
                              <Typography variant="caption" sx={{ ml: 0.5, fontSize: "0.7rem" }}>
                                {post.commentCount}
                              </Typography>
                            </IconButton>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton
                              size="small"
                              onClick={() => handleSavePost(post.id)}
                              sx={{
                                color: savedPosts.includes(post.id) ? "#facc15" : "rgba(255,255,255,0.7)",
                                mr: 1,
                              }}
                            >
                              {savedPosts.includes(post.id) ? (
                                <Bookmark fontSize="small" />
                              ) : (
                                <BookmarkAdd fontSize="small" />
                              )}
                            </IconButton>
                            <Link href={`/${post.type}s/${post.id}`} style={{ textDecoration: "none" }}>
                              <Button
                                size="small"
                                variant="text"
                                sx={{
                                  color: "#facc15",
                                  fontWeight: 600,
                                  "&:hover": {
                                    backgroundColor: "rgba(250, 204, 21, 0.1)",
                                  },
                                }}
                              >
                                View
                              </Button>
                            </Link>
                          </Box>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

// Loading skeleton component
function LoadingProfileSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: "16px",
          backgroundColor: "rgba(31, 41, 55, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        <Grid container spacing={0}>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              p: { xs: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRight: { md: "1px solid rgba(255, 255, 255, 0.1)" },
              borderBottom: { xs: "1px solid rgba(255, 255, 255, 0.1)", md: "none" },
            }}
          >
            <Skeleton
              variant="circular"
              width={isMobile ? 100 : 160}
              height={isMobile ? 100 : 160}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Skeleton variant="text" width={120} height={30} sx={{ mt: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
            <Skeleton variant="text" width={80} height={24} sx={{ mb: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="circular"
                  width={36}
                  height={36}
                  sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
              <Skeleton
                variant="rectangular"
                width="60%"
                height={36}
                sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
              <Skeleton
                variant="rectangular"
                width="40%"
                height={36}
                sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={8} sx={{ p: { xs: 3, md: 4 } }}>
            <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
            <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={4} key={i}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={80}
                    sx={{ borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }}
                  />
                </Grid>
              ))}
            </Grid>

            <Skeleton variant="text" width={200} height={24} sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />
          </Grid>
        </Grid>
      </Paper>

      <Skeleton
        variant="rectangular"
        width="100%"
        height={50}
        sx={{ borderRadius: 2, mb: 4, bgcolor: "rgba(255, 255, 255, 0.1)" }}
      />

      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={350}
              sx={{ borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
          </Grid>
        ))}
      </Grid>
    </motion.div>
  )
}

// Error display component
function ErrorDisplay({ error }: { error: string | null }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 500,
          borderRadius: "16px",
          backgroundColor: "rgba(31, 41, 55, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ color: "#ef4444", mb: 2 }}>
          Profile Not Found
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}>
          {error || "The user profile you're looking for doesn't exist or has been removed."}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          href="/dashboard"
          sx={{
            backgroundColor: "#facc15",
            color: "black",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#e2b714",
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  )
}

