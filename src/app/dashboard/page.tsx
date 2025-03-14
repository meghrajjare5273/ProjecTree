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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MoreHorizontal,
  MessageSquare,
  Heart,
} from "lucide-react";
import { Event, Project } from "@/types/posts";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

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
    if (activeTab === "all") return allPosts;
    if (activeTab === "projects")
      return allPosts.filter((post: Project) => post.type === "project");
    if (activeTab === "events")
      return allPosts.filter((post: Event) => post.type === "event");
    if (activeTab === "saved")
      return allPosts.filter((post: Post) => savedPosts.includes(post.id));
    return allPosts;
  }, [allPosts, activeTab, savedPosts]);

  // Format date
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Handle loading state
  const isLoading = !profileData || !projectsData || !eventsData;

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Sidebar */}
      <div className="w-60 fixed h-full bg-[#1a1a1a] border-r border-[#333333]">
        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className="p-4 flex flex-col items-center border-b border-[#333333]">
            {user ? (
              <>
                <Link href={`/users/${user.username}`}>
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={user.image || "/placeholder.svg?height=96&width=96"}
                      alt={user.name || "User"}
                      className="rounded-full object-cover"
                      fill
                    />
                  </div>
                </Link>
                <h3 className="text-white font-medium">{user.name}</h3>
                <p className="text-gray-400 text-sm">@{user.username}</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-gray-700 animate-pulse mb-2"></div>
                <div className="h-5 w-24 bg-gray-700 animate-pulse mb-1"></div>
                <div className="h-4 w-20 bg-gray-700 animate-pulse"></div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="py-4">
            <h4 className="px-4 text-gray-400 text-xs uppercase font-medium mb-2">
              Navigation
            </h4>
            <nav>
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-2 text-white bg-[#333333]"
              >
                <Home className="w-5 h-5 mr-3" />
                <span>Home</span>
              </Link>
              <Link
                href="/explore"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
              >
                <Search className="w-5 h-5 mr-3" />
                <span>Explore</span>
              </Link>
              <Link
                href="/notifications"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333] justify-between"
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-3" />
                  <span>Notifications</span>
                </div>
                <span className="bg-[#ffcc00] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  3
                </span>
              </Link>
              <Link
                href="/bookmarks"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
              >
                <Bookmark className="w-5 h-5 mr-3" />
                <span>Bookmarks</span>
              </Link>
            </nav>
          </div>

          {/* Content */}
          <div className="py-4">
            <h4 className="px-4 text-gray-400 text-xs uppercase font-medium mb-2">
              Content
            </h4>
            <nav>
              <Link
                href="/projects"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
              >
                <Layers className="w-5 h-5 mr-3" />
                <span>Projects</span>
              </Link>
              <Link
                href="/events"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>Events</span>
              </Link>
              <Link
                href="/people"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
              >
                <Users className="w-5 h-5 mr-3" />
                <span>People</span>
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="mt-auto py-4 border-t border-[#333333]">
            <Link
              href={`/users/${user?.username}`}
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
            >
              <UserIcon className="w-5 h-5 mr-3" />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333]"
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-[#333333] text-left"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-60 flex-1">
        {/* Header */}
        <header className="bg-[#1a1a1a] border-b border-[#333333] py-4 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-white text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {user?.name || "User"}
              </p>
            </div>
            <Link href={"/create-post"}>
              <button className="bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium px-4 py-2 rounded-md">
                Create Post
              </button>
            </Link>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-[#1a1a1a] border-b border-[#333333] px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 flex items-center ${
                activeTab === "all"
                  ? "border-b-2 border-[#ffcc00] text-white"
                  : "text-gray-400"
              }`}
            >
              <Layers className="w-4 h-4 mr-2" />
              <span>All Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-3 flex items-center ${
                activeTab === "projects"
                  ? "border-b-2 border-[#ffcc00] text-white"
                  : "text-gray-400"
              }`}
            >
              <Layers className="w-4 h-4 mr-2" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-4 py-3 flex items-center ${
                activeTab === "events"
                  ? "border-b-2 border-[#ffcc00] text-white"
                  : "text-gray-400"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-3 flex items-center ${
                activeTab === "saved"
                  ? "border-b-2 border-[#ffcc00] text-white"
                  : "text-gray-400"
              }`}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              <span>Saved</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#333333]"
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
                  <div className="border-t border-[#333333] p-3 flex justify-between">
                    <div className="flex space-x-4">
                      <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                      <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : profileError || projectsError || eventsError ? (
            <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-[#333333]">
              <h3 className="text-xl font-semibold text-red-400">
                Error Loading Data
              </h3>
              <p className="text-gray-400 mt-2">
                There was a problem fetching your content. Please try again
                later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 border border-[#ffcc00] text-[#ffcc00] rounded-md hover:bg-[#ffcc00]/10"
              >
                Retry
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-[#333333]">
              <h3 className="text-xl font-semibold text-white">
                No Posts Found
              </h3>
              <p className="text-gray-400 mt-2">
                {activeTab === "saved"
                  ? "You haven't saved any posts yet."
                  : `No ${
                      activeTab === "all" ? "posts" : activeTab
                    } available.`}
              </p>
              <button className="mt-4 px-4 py-2 bg-[#ffcc00] text-black rounded-md hover:bg-[#e6b800]">
                Create New Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post: Post) => (
                <div
                  key={post.id}
                  className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#333333]"
                >
                  {post.images && post.images.length > 0 && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={
                          post.images[0] ||
                          "/placeholder.svg?height=192&width=384"
                        }
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 right-3 bg-[#ffcc00] text-black text-xs font-bold px-2 py-1 rounded">
                        {post.type}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <Link
                        href={`/users/${post.user.username}`}
                        className="flex items-center"
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          {post.user.image ? (
                            <Image
                              src={post.user.image || "/placeholder.svg"}
                              alt={post.user.username}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#333333] text-white">
                              {post.user.username?.charAt(0).toUpperCase() ||
                                "U"}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-white font-medium">
                            @{post.user.username}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {/* {formatDate(post.createdAt)} */}
                          </p>
                        </div>
                      </Link>
                    </div>

                    <Link href={`/${post.type}s/${post.id}`}>
                      <h3 className="text-white text-lg font-semibold mb-2 hover:text-[#ffcc00]">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {post.description}
                    </p>

                    {post.type === "event" && post.date && (
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-[#ffcc00]" />
                        <span>
                          {new Date(post.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-[#333333] p-3 flex justify-between">
                    <div className="flex space-x-4">
                      <button
                        className="flex items-center text-gray-400 hover:text-white"
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart
                          className={`w-5 h-5 mr-1 ${
                            likedPosts.includes(post.id)
                              ? "fill-[#ffcc00] text-[#ffcc00]"
                              : ""
                          }`}
                        />
                        <span>Like</span>
                      </button>
                      <Link
                        href={`/${post.type}s/${post.id}`}
                        className="flex items-center text-gray-400 hover:text-white"
                      >
                        <MessageSquare className="w-5 h-5 mr-1" />
                        <span>Comment</span>
                      </Link>
                    </div>
                    <button
                      className="text-gray-400 hover:text-white"
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
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
