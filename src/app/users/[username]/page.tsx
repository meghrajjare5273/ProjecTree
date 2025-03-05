/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
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
  Skeleton,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
} from "@mui/material";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Favorite,
  Comment,
  LocationOn,
  CalendarMonth,
  GitHub,
  LinkedIn,
  Twitter,
  Instagram,
  Facebook,
  Language,
} from "@mui/icons-material";

// Add generateMetadata function at the top of the file, before the component definitions
// export async function generateMetadata({ params }: { params: { username: string } }) {
//   const username = params.username

//   return {
//     title: `${username}'s Profile | Community Platform`,
//     description: `View ${username}'s profile, projects, and events on our community platform.`,
//     openGraph: {
//       title: `${username}'s Profile | Community Platform`,
//       description: `Check out ${username}'s contributions, projects, and upcoming events.`,
//       type: "profile",
//       images: [
//         {
//           url: "/og-profile-image.jpg",
//           width: 1200,
//           height: 630,
//           alt: `${username}'s profile`,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${username}'s Profile | Community Platform`,
//       description: `View ${username}'s profile, projects, and events on our community platform.`,
//       images: ["/og-profile-image.jpg"],
//     },
//   }
// }

// Update the theme with improved color scheme for better readability
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#facc15", // Yellow accent color from dashboard
      light: "#fde68a",
      dark: "#f59e0b",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#111827", // Dark background
      paper: "rgba(17, 24, 39, 0.8)", // Darker background for better contrast
    },
    warning: {
      main: "#facc15", // Yellow accent color
      light: "#fde68a",
      dark: "#f59e0b",
    },
    text: {
      primary: "#ffffff",
      secondary: "#d1d5db",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#ffffff",
    },
    h5: {
      fontWeight: 600,
      color: "#ffffff",
    },
    h6: {
      fontWeight: 600,
      color: "#ffffff",
    },
    body1: {
      color: "#e2e8f0",
    },
    body2: {
      color: "#cbd5e1",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backgroundColor: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        outlined: {
          borderColor: "rgba(250, 204, 21, 0.5)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#d1d5db",
          "&.Mui-selected": {
            color: "#facc15",
          },
        },
      },
    },
  },
});

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Types remain the same as in the original file
type ProfileUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  socialLinks: Record<string, string>;
  createdAt: string;
};

type ExtendedPost = {
  id: string;
  title: string;
  description: string;
  type: "project" | "event";
  images?: string[];
  tags?: string[];
  date?: string;
  location?: string;
  createdAt: string;
  commentCount: number;
};

type ProfileData = {
  user: ProfileUser;
  posts: ExtendedPost[];
};

// Fetcher function
const fetchProfileData = async (username: string): Promise<ProfileData> => {
  const response = await fetch(`/api/users/${username}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }
  return response.json();
};

// Helper function to format dates
function formatDate(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Social icon mapper
const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "github":
      return <GitHub />;
    case "linkedin":
      return <LinkedIn />;
    case "twitter":
      return <Twitter />;
    case "instagram":
      return <Instagram />;
    case "facebook":
      return <Facebook />;
    default:
      return <Language />;
  }
};

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await fetchProfileData(username);
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError("User not found or an error occurred");
        console.log(err);
        setLoading(false);
      }
    };
    loadProfileData();
  }, [username]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100vh",
          py: 4,
          backgroundImage: "linear-gradient(to bottom, #0f172a, #111827)",
        }}
      >
        <Container maxWidth="lg">
          {loading ? (
            <LoadingProfileSkeleton />
          ) : error || !profileData ? (
            <ErrorDisplay error={error} />
          ) : (
            <ProfileContent
              profileData={profileData}
              router={router}
              tabValue={tabValue}
              handleTabChange={handleTabChange}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

// Loading skeleton component
function LoadingProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Skeleton
              variant="circular"
              width={150}
              height={150}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Skeleton
              variant="text"
              width="60%"
              height={60}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={30}
              sx={{ mb: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={60}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton
                variant="rectangular"
                width={100}
                height={36}
                sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={36}
                sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={36}
                sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ p: 4 }}>
        <Skeleton
          variant="text"
          width="40%"
          height={40}
          sx={{ mx: "auto", mb: 3, bgcolor: "rgba(255, 255, 255, 0.1)" }}
        />
        <Stack spacing={3}>
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
          ))}
        </Stack>
      </Paper>
    </motion.div>
  );
}

// Error display component
function ErrorDisplay({ error }: { error: string | null }) {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          maxWidth: 500,
          borderTop: "4px solid",
          borderColor: "error.main",
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography color="text.secondary">
          {error ||
            "Profile not found. The user may not exist or has been removed."}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => (window.location.href = "/")}
        >
          Go to Homepage
        </Button>
      </Paper>
    </Box>
  );
}

// Main profile content component
function ProfileContent({
  profileData,
  router,
  tabValue,
  handleTabChange,
}: {
  profileData: ProfileData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  tabValue: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}) {
  const { user, posts } = profileData;
  const projectPosts = posts.filter((post) => post.type === "project");
  const eventPosts = posts.filter((post) => post.type === "event");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Profile Header */}
      <Paper
        elevation={1}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "30%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(250, 204, 21, 0.1) 100%)",
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
            zIndex: 0,
          }}
        />

        <Grid container spacing={4} sx={{ position: "relative", zIndex: 1 }}>
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            <Avatar
              alt={user.name || user.username}
              src={user.image || ""}
              sx={{
                width: 150,
                height: 150,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                border: "4px solid rgba(250, 204, 21, 0.5)",
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <CalendarMonth fontSize="small" />
              Member since{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#ffffff",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {user.name || user.username || "Anonymous"}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    display: "inline-block",
                    background:
                      "linear-gradient(90deg, #facc15 0%, #fde68a 100%)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    color: "#111827",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  @{user.username}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Favorite />}
                sx={{
                  borderRadius: "20px",
                  px: 3,
                  boxShadow: "0 4px 12px rgba(250, 204, 21, 0.3)",
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                Follow
              </Button>
            </Box>

            {user.bio && (
              <Typography
                variant="body1"
                sx={{
                  color: "#e2e8f0",
                  mt: 1,
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: "1.05rem",
                }}
              >
                {user.bio}
              </Typography>
            )}

            <Divider sx={{ my: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

            <Typography variant="subtitle2" color="#d1d5db" gutterBottom>
              Connect with {user.name || user.username}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
            >
              {Object.entries(user.socialLinks).map(([platform, url]) => (
                <Button
                  key={platform}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={getSocialIcon(platform)}
                  onClick={() => window.open(url, "_blank")}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "capitalize",
                    "&:hover": {
                      backgroundColor: "rgba(250, 204, 21, 0.1)",
                    },
                  }}
                >
                  {platform}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Posts Section */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: "rgba(17, 24, 39, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "rgba(255, 255, 255, 0.1)" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            aria-label="profile content tabs"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#facc15",
              },
            }}
          >
            <Tab label="All Posts" />
            <Tab label="Projects" />
            <Tab label="Events" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <PostsTabContent posts={posts} user={user} />}
          {tabValue === 1 && (
            <PostsTabContent posts={projectPosts} user={user} />
          )}
          {tabValue === 2 && <PostsTabContent posts={eventPosts} user={user} />}
        </Box>
      </Paper>
    </motion.div>
  );
}

// Posts tab content component
function PostsTabContent({
  posts,
  user,
}: {
  posts: ExtendedPost[];
  user: ProfileUser;
}) {
  if (posts.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="#d1d5db" sx={{ mb: 2 }}>
          No posts to display in this category.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{
            borderColor: "rgba(250, 204, 21, 0.5)",
            "&:hover": {
              borderColor: "#facc15",
              backgroundColor: "rgba(250, 204, 21, 0.1)",
            },
          }}
        >
          Create New Post
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid item xs={12} md={6} lg={4} key={post.id}>
          <motion.div
            variants={itemVariants}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  borderColor: "rgba(250, 204, 21, 0.3)",
                },
              }}
            >
              {post.images && post.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={post.images[0]}
                  alt={post.title}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    background:
                      post.type === "project"
                        ? "linear-gradient(135deg, rgba(250, 204, 21, 0.7) 0%, rgba(245, 158, 11, 0.7) 100%)"
                        : "linear-gradient(135deg, rgba(250, 204, 21, 0.7) 0%, rgba(251, 191, 36, 0.7) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#111827",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#111827" }}
                  >
                    {post.type === "project" ? "Project" : "Event"}
                  </Typography>
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
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
                    component="div"
                    sx={{
                      fontWeight: 600,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.3,
                      color: "#ffffff",
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Chip
                    label={post.type}
                    size="small"
                    color="primary"
                    sx={{
                      ml: 1,
                      textTransform: "capitalize",
                      color: "#111827",
                      fontWeight: 600,
                      backgroundColor:
                        post.type === "project" ? "#facc15" : "#fbbf24",
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    height: "4.5em",
                    color: "#d1d5db",
                    lineHeight: 1.6,
                  }}
                >
                  {post.description}
                </Typography>

                {post.type === "project" &&
                  post.tags &&
                  post.tags.length > 0 && (
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
                          variant="outlined"
                          color="primary"
                          sx={{
                            fontSize: "0.7rem",
                            color: "#facc15",
                            borderColor: "rgba(250, 204, 21, 0.5)",
                          }}
                        />
                      ))}
                      {post.tags.length > 3 && (
                        <Chip
                          label={`+${post.tags.length - 3}`}
                          size="small"
                          color="primary"
                          sx={{
                            fontSize: "0.7rem",
                            color: "#111827",
                            backgroundColor: "#facc15",
                          }}
                        />
                      )}
                    </Box>
                  )}

                {post.type === "event" && post.date && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarMonth
                      fontSize="small"
                      sx={{ mr: 0.5, color: "#facc15" }}
                    />
                    <Typography variant="body2" sx={{ color: "#d1d5db" }}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>

                    {post.location && (
                      <>
                        <Box
                          component="span"
                          sx={{ mx: 0.5, color: "#d1d5db" }}
                        >
                          •
                        </Box>
                        <LocationOn
                          fontSize="small"
                          sx={{ mr: 0.5, color: "#facc15" }}
                        />
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: "120px", color: "#d1d5db" }}
                        >
                          {post.location}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </CardContent>

              <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />

              <CardActions
                sx={{ justifyContent: "space-between", px: 3, py: 1.5 }}
              >
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {formatDate(post.createdAt)}
                </Typography>

                <Box>
                  <IconButton
                    size="small"
                    aria-label="comments"
                    sx={{ color: "#d1d5db" }}
                  >
                    <Comment fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {post.commentCount}
                    </Typography>
                  </IconButton>

                  <Link href={`/${post.type}s/${post.id}`} passHref>
                    <Button
                      size="small"
                      color="primary"
                      sx={{
                        ml: 1,
                        color: "#facc15",
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
  );
}
