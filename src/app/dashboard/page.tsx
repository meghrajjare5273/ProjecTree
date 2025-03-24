"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth-client";
import type User from "@/types/users";
import type Post from "@/types/posts";

// Icons
import {
  Home,
  Search,
  Bell,
  Bookmark,
  Layers,
  Calendar,
  Users,
  UserIcon,
  Settings,
  LogOut,
  MessageSquare,
  Heart,
  Menu,
  X,
  TrendingUp,
  Plus,
  ChevronRight,
  Filter,
} from "lucide-react";
import type { Event, Project } from "@/types/posts";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Handle sign out
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar when clicking on a link
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Combine and sort posts
  const allPosts = useMemo(() => {
    return (projectsData?.data || [])
      .map((p: Project) => ({ ...p, type: "project" }))
      .concat(
        (eventsData?.data || []).map((e: Event) => ({ ...e, type: "event" }))
      )
      .sort(
        (a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [projectsData, eventsData]);

  // Filtered posts based on tab
  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    // Filter by tab
    if (activeTab === "projects") {
      posts = posts.filter((post: Project) => post.type === "project");
    } else if (activeTab === "events") {
      posts = posts.filter((post: Event) => post.type === "event");
    } else if (activeTab === "saved") {
      posts = posts.filter((post: Post) => savedPosts.includes(post.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post: Post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query)
      );
    }

    return posts;
  }, [allPosts, activeTab, savedPosts, searchQuery]);

  // Format date
  const formatDate = (dateString: Date) => {
    return formatDistanceToNow(dateString, { addSuffix: true });
  };

  // Handle loading state
  const isLoading = !profileData || !projectsData || !eventsData;

  // Trending topics (simulated)
  const trendingTopics = [
    "Hackathon",
    "AI Projects",
    "Web Development",
    "Mobile Apps",
    "Design",
  ];

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#1a1a1a] text-white p-2 rounded-full shadow-lg"
        aria-label="Toggle sidebar"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`${
          mobileSidebarOpen
            ? "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            : "hidden"
        } md:hidden`}
        onClick={toggleMobileSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:sticky md:translate-x-0 top-0 left-0 z-40 w-[280px] h-screen bg-[#1a1a1a] border-r border-[#333333] transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-center">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            Projec<span className="text-[#ffcc00]">Tree</span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 flex flex-col items-center border-b border-[#333333]">
          {user ? (
            <>
              <Link
                href={`/users/${user.username}`}
                onClick={closeMobileSidebar}
              >
                <div className="relative w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.3)]">
                  <Image
                    src={user.image || "/placeholder.svg?height=96&width=96"}
                    alt={user.name || "User"}
                    className="rounded-full object-cover"
                    fill
                  />
                </div>
              </Link>
              <h3 className="text-white font-medium text-lg">{user.name}</h3>
              <p className="text-gray-400 text-sm">@{user.username}</p>

              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-[#ffcc00] font-bold">12</p>
                  <p className="text-xs text-gray-400">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-[#ffcc00] font-bold">48</p>
                  <p className="text-xs text-gray-400">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-[#ffcc00] font-bold">96</p>
                  <p className="text-xs text-gray-400">Followers</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse mb-3"></div>
              <div className="h-5 w-24 bg-gray-700 animate-pulse mb-1"></div>
              <div className="h-4 w-20 bg-gray-700 animate-pulse mb-3"></div>
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-5 w-8 bg-gray-700 animate-pulse mb-1"></div>
                    <div className="h-3 w-12 bg-gray-700 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2.5 text-white bg-[#252525] rounded-lg"
              onClick={closeMobileSidebar}
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Home</span>
            </Link>
            <Link
              href="/explore"
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
              onClick={closeMobileSidebar}
            >
              <Search className="w-5 h-5 mr-3" />
              <span>Explore</span>
            </Link>
            <Link
              href="/notifications"
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors justify-between"
              onClick={closeMobileSidebar}
            >
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </div>
              <Badge className="bg-[#ffcc00] text-black hover:bg-[#ffcc00]">
                3
              </Badge>
            </Link>
            <Link
              href="/bookmarks"
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
              onClick={closeMobileSidebar}
            >
              <Bookmark className="w-5 h-5 mr-3" />
              <span>Bookmarks</span>
            </Link>
          </div>

          <Separator className="my-6 bg-[#333333]" />

          <div className="space-y-1">
            <h4 className="text-gray-400 text-xs uppercase font-medium px-4 mb-2">
              Content
            </h4>
            <Link
              href="/projects"
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
              onClick={closeMobileSidebar}
            >
              <Layers className="w-5 h-5 mr-3" />
              <span>Projects</span>
            </Link>
            <Link
              href="/events"
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
              onClick={closeMobileSidebar}
            >
              <Calendar className="w-5 h-5 mr-3" />
              <span>Events</span>
            </Link>
            <Link
              href="/people"
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
              onClick={closeMobileSidebar}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>People</span>
            </Link>
          </div>
        </nav>

        {/* Create Post Button */}
        <div className="px-6 py-4">
          <Link href="/create-post" onClick={closeMobileSidebar}>
            <Button className="w-full bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>

        {/* User Menu */}
        <div className="mt-auto p-4 border-t border-[#333333]">
          <div className="flex items-center justify-between p-2 hover:bg-[#252525] rounded-lg transition-colors">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
              <Link
                href={`/users/${user?.username}`}
                className="text-gray-300"
                onClick={closeMobileSidebar}
              >
                Profile
              </Link>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-[#252525] rounded-lg transition-colors">
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-3 text-gray-400" />
              <Link
                href="/settings"
                className="text-gray-300"
                onClick={closeMobileSidebar}
              >
                Settings
              </Link>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-2 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors text-left mt-2"
          >
            <div className="flex items-center">
              <LogOut className="w-5 h-5 mr-3 text-gray-400" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333] py-4 px-6 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="ml-8 md:ml-0 flex-1">
              <h1 className="text-white text-xl md:text-2xl font-bold">
                Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                Welcome back, {user?.name || "User"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#252525] border-[#333333] pl-10 pr-4 py-2 rounded-full text-white w-full focus-visible:ring-[#ffcc00]/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <Link href="/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-300 hover:text-white hover:bg-[#252525]"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-300 hover:text-white hover:bg-[#252525] relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#ffcc00] rounded-full"></span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Feed */}
            <div className="flex-1 order-2 md:order-1">
              {/* Mobile Search */}
              <div className="relative mb-4 md:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#252525] border-[#333333] pl-10 pr-4 py-2 rounded-full text-white w-full focus-visible:ring-[#ffcc00]/30"
                />
              </div>

              {/* Tabs */}
              <div className="bg-[#1a1a1a] rounded-lg mb-6 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-3 flex-1 flex justify-center items-center ${
                      activeTab === "all"
                        ? "border-b-2 border-[#ffcc00] text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
                    }`}
                  >
                    <span>All Posts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`px-4 py-3 flex-1 flex justify-center items-center ${
                      activeTab === "projects"
                        ? "border-b-2 border-[#ffcc00] text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
                    }`}
                  >
                    <span>Projects</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`px-4 py-3 flex-1 flex justify-center items-center ${
                      activeTab === "events"
                        ? "border-b-2 border-[#ffcc00] text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
                    }`}
                  >
                    <span>Events</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`px-4 py-3 flex-1 flex justify-center items-center ${
                      activeTab === "saved"
                        ? "border-b-2 border-[#ffcc00] text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
                    }`}
                  >
                    <span>Saved</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-white font-medium">
                  {filteredPosts.length}{" "}
                  {activeTab === "all" ? "Posts" : activeTab}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#333333] text-gray-300 hover:bg-[#252525] hover:text-white"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card
                      key={i}
                      className="bg-[#1a1a1a] border-[#333333] overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                          <div className="ml-3">
                            <div className="h-4 w-24 bg-gray-700 animate-pulse mb-1"></div>
                            <div className="h-3 w-16 bg-gray-700 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-5 w-3/4 bg-gray-700 animate-pulse mb-2"></div>
                        <div className="h-4 w-full bg-gray-700 animate-pulse mb-1"></div>
                        <div className="h-4 w-5/6 bg-gray-700 animate-pulse mb-4"></div>
                      </div>
                      <div className="h-40 bg-gray-700 animate-pulse"></div>
                      <div className="border-t border-[#333333] p-3 flex justify-between">
                        <div className="flex space-x-4">
                          <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                          <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : profileError || projectsError || eventsError ? (
                <Card className="bg-[#1a1a1a] border-[#333333] p-6 text-center">
                  <h3 className="text-xl font-semibold text-red-400">
                    Error Loading Data
                  </h3>
                  <p className="text-gray-400 mt-2">
                    There was a problem fetching your content. Please try again
                    later.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 border border-[#ffcc00] text-[#ffcc00] bg-transparent hover:bg-[#ffcc00]/10"
                  >
                    Retry
                  </Button>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="bg-[#1a1a1a] border-[#333333] p-6 text-center">
                  <h3 className="text-xl font-semibold text-white">
                    No Posts Found
                  </h3>
                  <p className="text-gray-400 mt-2">
                    {activeTab === "saved"
                      ? "You haven't saved any posts yet."
                      : searchQuery
                      ? "No results match your search."
                      : `No ${
                          activeTab === "all" ? "posts" : activeTab
                        } available.`}
                  </p>
                  <Link href="/create-post">
                    <Button className="mt-4 bg-[#ffcc00] text-black hover:bg-[#e6b800]">
                      Create New Post
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post: Post) => (
                    <Card
                      key={post.id}
                      className="bg-[#1a1a1a] border-[#333333] overflow-hidden hover:border-[#444444] transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <Link
                            href={`/users/${post.user.username}`}
                            className="flex items-center"
                          >
                            <Avatar className="h-10 w-10 border border-[#333333]">
                              {post.user.image ? (
                                <Image
                                  src={post.user.image || "/placeholder.svg"}
                                  alt={post.user.username}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#333333] text-white">
                                  {post.user.username
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </div>
                              )}
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-white font-medium">
                                @{post.user.username}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {formatDate(post.createdAt)}
                              </p>
                            </div>
                          </Link>
                          <Badge className="ml-auto bg-[#252525] text-[#ffcc00] hover:bg-[#252525]">
                            {post.type}
                          </Badge>
                        </div>

                        <Link href={`/${post.type}s/${post.id}`}>
                          <h3 className="text-white text-lg font-semibold mb-2 hover:text-[#ffcc00] transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4">
                          {post.description.length > 150
                            ? `${post.description.substring(0, 150)}...`
                            : post.description}
                        </p>

                        {post.type === "event" && post.date && (
                          <div className="flex items-center text-sm text-gray-400 mb-3">
                            <Calendar className="w-4 h-4 mr-2 text-[#ffcc00]" />
                            <span>
                              {new Date(post.date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}

                        {post.images && post.images.length > 0 && (
                          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                            <Image
                              src={
                                post.images[0] ||
                                "/placeholder.svg?height=256&width=512"
                              }
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                className="bg-[#252525] text-gray-300 hover:bg-[#333333]"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t border-[#333333] p-3 flex justify-between">
                        <div className="flex space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-[#252525]"
                            onClick={() => handleLikePost(post.id)}
                          >
                            <Heart
                              className={`w-5 h-5 mr-2 ${
                                likedPosts.includes(post.id)
                                  ? "fill-[#ffcc00] text-[#ffcc00]"
                                  : ""
                              }`}
                            />
                            <span>Like</span>
                          </Button>
                          <Link href={`/${post.type}s/${post.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white hover:bg-[#252525]"
                            >
                              <MessageSquare className="w-5 h-5 mr-2" />
                              <span>Comment</span>
                            </Button>
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-[#252525]"
                          onClick={() => handleSavePost(post.id)}
                        >
                          <Bookmark
                            className={`w-5 h-5 ${
                              savedPosts.includes(post.id)
                                ? "fill-[#ffcc00] text-[#ffcc00]"
                                : ""
                            }`}
                          />
                          <span className="sr-only">Save</span>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full md:w-80 order-1 md:order-2">
              {/* Create Post Card */}
              <Card className="bg-[#1a1a1a] border-[#333333] mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 border border-[#333333]">
                      {user?.image ? (
                        <Image
                          src={user.image || "/placeholder.svg"}
                          alt={user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#333333] text-white">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </Avatar>
                    <Link href="/create-post" className="flex-1">
                      <div className="bg-[#252525] text-gray-400 rounded-full px-4 py-2 cursor-pointer hover:bg-[#333333] transition-colors">
                        What&apos;s on your mind?
                      </div>
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <Link href="/create-post?type=project">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-[#252525]"
                      >
                        <Layers className="w-4 h-4 mr-2 text-[#ffcc00]" />
                        Project
                      </Button>
                    </Link>
                    <Link href="/create-post?type=event">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-[#252525]"
                      >
                        <Calendar className="w-4 h-4 mr-2 text-[#ffcc00]" />
                        Event
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="bg-[#1a1a1a] border-[#333333] mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Trending Topics</h3>
                    <TrendingUp className="w-4 h-4 text-[#ffcc00]" />
                  </div>
                  <div className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between hover:bg-[#252525] p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center">
                          <span className="text-[#ffcc00] font-medium mr-2">
                            #{index + 1}
                          </span>
                          <span className="text-gray-300">{topic}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {Math.floor(Math.random() * 1000) + 100}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Users */}
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardContent className="p-4">
                  <h3 className="text-white font-medium mb-4">
                    Suggested Users
                  </h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 border border-[#333333]">
                            <Image
                              src={`/placeholder.svg?height=40&width=40&text=U${i}`}
                              alt={`User ${i}`}
                              fill
                              className="object-cover"
                            />
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-white text-sm font-medium">
                              User Name {i}
                            </p>
                            <p className="text-gray-500 text-xs">
                              @username{i}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#ffcc00] text-[#ffcc00] hover:bg-[#ffcc00]/10"
                        >
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
