//components/nav-logged-in.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Avatar,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  Home,
  Message,
  Notifications,
  AccountCircle,
  Settings,
  Bookmark,
  ExitToApp,
  Add,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { authClient } from "@/lib/auth-client";

// Styled Components
const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "#facc15",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#facc15",
    },
  },
  "& .MuiInputBase-input": {
    padding: "8px 12px",
  },
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#facc15",
    color: "#000",
    fontWeight: "bold",
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    backgroundColor: "#121212",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    minWidth: "200px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.6)",
  },
  "& .MuiMenuItem-root": {
    color: "#fff",
    padding: "10px 16px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
}));

// Animation Variants
const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const itemVariants = {
  hover: { scale: 1.1, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

export default function NavbarLoggedIn() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState(3); // Example notification count
  const [messageCount, setMessageCount] = useState(2); // Example message count

  useEffect(() => {
    const fetchUser = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.push("/auth?mode=signin");
        return;
      }
      const res = await fetch("/api/profile", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          return redirect("/");
        },
      },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md px-6 py-3"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxWidth="7xl"
        mx="auto"
      >
        {/* Left: Logo */}
        <Link href="/" className="group flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold text-white relative tracking-tight"
          >
            Projec
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="hover:text-yellow-400"
            >
              Tree
            </motion.span>
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-300 group-hover:w-full transition-all duration-300 rounded-full" />
          </motion.div>
        </Link>

        {/* Center: Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="hidden md:block"
        >
          <StyledTextField
            placeholder="Search projects or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { md: "300px", lg: "400px" } }}
          />
        </motion.form>

        {/* Right: Navigation Icons and Profile */}
        <Box display="flex" gap={2} alignItems="center">
          {/* Navigation Icons */}
          <Box display="flex" gap={1} alignItems="center" mr={1}>
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Tooltip title="Home">
                <Link href="/dashboard">
                  <IconButton
                    sx={{
                      color: "#fff",
                      "&:hover": { color: "#facc15" },
                    }}
                  >
                    <Home />
                  </IconButton>
                </Link>
              </Tooltip>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Tooltip title="Messages">
                <Link href="/messages">
                  <IconButton
                    sx={{
                      color: "#fff",
                      "&:hover": { color: "#facc15" },
                    }}
                  >
                    <StyledBadge badgeContent={messageCount} color="secondary">
                      <Message />
                    </StyledBadge>
                  </IconButton>
                </Link>
              </Tooltip>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Tooltip title="Notifications">
                <Link href="/notifications">
                  <IconButton
                    sx={{
                      color: "#fff",
                      "&:hover": { color: "#facc15" },
                    }}
                  >
                    <StyledBadge
                      badgeContent={notificationCount}
                      color="secondary"
                    >
                      <Notifications />
                    </StyledBadge>
                  </IconButton>
                </Link>
              </Tooltip>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Tooltip title="Create New Project">
                <Link href="/create">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      backgroundColor: "#facc15",
                      color: "#000",
                      borderRadius: "20px",
                      textTransform: "none",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#e2b714",
                      },
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    Create
                  </Button>
                </Link>
              </Tooltip>
            </motion.div>
          </Box>

          {/* Search Icon for Mobile */}
          <Box display={{ xs: "block", md: "none" }}>
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <IconButton
                onClick={() => router.push("/search")}
                sx={{
                  color: "#fff",
                  "&:hover": { color: "#facc15" },
                }}
              >
                <Search />
              </IconButton>
            </motion.div>
          </Box>

          {/* Profile Section with Dropdown */}
          {user && (
            <>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  onClick={handleProfileClick}
                  display="flex"
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                >
                  <Avatar
                    src={user.image || ""}
                    alt={user.username}
                    sx={{
                      width: 38,
                      height: 38,
                      border: "2px solid #facc15",
                    }}
                  />
                  <KeyboardArrowDown
                    sx={{
                      color: "#fff",
                      fontSize: 20,
                      ml: 0.5,
                      transition: "transform 0.2s",
                      transform: Boolean(anchorEl)
                        ? "rotate(180deg)"
                        : "rotate(0)",
                    }}
                  />
                </Box>
              </motion.div>

              <StyledMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                TransitionComponent={Fade} // Using Material UI's Fade instead of motion.div
              >
                <Box px={2} py={1.5}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="white"
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="gray">
                    @{user.username}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

                <MenuItem onClick={() => handleMenuAction(`users/${user.username}`)}>
                  <AccountCircle sx={{ mr: 2 }} /> My Profile
                </MenuItem>

                <MenuItem onClick={() => handleMenuAction("/bookmarks")}>
                  <Bookmark sx={{ mr: 2 }} /> Saved Projects
                </MenuItem>

                <MenuItem onClick={() => handleMenuAction("/settings")}>
                  <Settings sx={{ mr: 2 }} /> Settings
                </MenuItem>

                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

                <MenuItem onClick={handleSignOut}>
                  <ExitToApp sx={{ mr: 2 }} /> Sign Out
                </MenuItem>
              </StyledMenu>
            </>
          )}
        </Box>
      </Box>
    </motion.nav>
  );
}