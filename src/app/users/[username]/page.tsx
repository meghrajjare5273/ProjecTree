/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Icons
import {
  Calendar,
  Heart,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Mail,
  MapPin,
  Share2,
  Grid,
  LayoutList,
  CalendarDays,
} from "lucide-react";
import FollowButton from "@/components/follow-button";
import type { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Types
type ProfileUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  socialLinks: Record<string, string>;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
  };
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
  user: {
    username: string;
    image: string | null;
  };
};

type ProfileData = {
  user: ProfileUser;
  posts: ExtendedPost[];
};

// Fetcher function with transformation to match ProfileData
const fetchProfileData = async (username: string): Promise<ProfileData> => {
  const response = await fetch(`/api/users/${username}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }
  const { data: apiUser } = await response.json();

  // Map API user to ProfileUser
  const profileUser: ProfileUser = {
    id: apiUser.id,
    name: apiUser.name,
    username: apiUser.username,
    image: apiUser.image,
    bio: apiUser.bio,
    socialLinks: apiUser.socialLinks || {}, // Handle null by defaulting to empty object
    createdAt: apiUser.createdAt.toString(), // Convert Date to string
    _count: apiUser._count || { followers: 0, following: 0 },
  };

  // Combine projects and events into a single posts array
  const posts: ExtendedPost[] = [
    ...(apiUser.projects || []).map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      type: "project" as const,
      images: project.images || undefined,
      tags: project.tags || undefined,
      createdAt: project.createdAt.toString(),
      commentCount: project.comments?.length || 0,
      user: {
        username: apiUser.username,
        image: apiUser.image,
      },
    })),
    ...(apiUser.events || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: "event" as const,
      images: event.images || undefined,
      tags: event.tags || undefined,
      date: event.date ? event.date.toString() : undefined,
      location: event.location || undefined,
      createdAt: event.createdAt.toString(),
      commentCount: event.comments?.length || 0,
      user: {
        username: apiUser.username,
        image: apiUser.image,
      },
    })),
  ];

  return { user: profileUser, posts };
};

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Fix for hydration mismatch - ensure we only run this on the client
    if (typeof window !== "undefined") {
      // Fetch profile data only when username exists
      if (username) {
        const loadProfileData = async () => {
          try {
            const data = await fetchProfileData(username);
            setProfileData(data);
            setLoading(false);
          } catch (err) {
            setError("User not found or an error occurred");
            console.error(err);
            setLoading(false);
          }
        };
        loadProfileData();
      }
    }
  }, [username]);

  // Load current user
  useEffect(() => {
    if (typeof window !== "undefined" && profileData?.user?.id) {
      const loadCurrentUser = async () => {
        try {
          const session = await authClient.getSession();
          if (session?.data?.user) {
            setCurrentUser(session.data.user);
          }
        } catch (error) {
          console.error("Error loading user session:", error);
        }
      };
      loadCurrentUser();
    }
  }, [profileData]);

  // Simulate saved and liked posts (would come from API in real app)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Simulated saved and liked posts
      const mockSaved = ["1", "3", "5"];
      const mockLiked = ["2", "4", "6"];
      setSavedPosts(mockSaved);
      setLikedPosts(mockLiked);
    }
  }, []);

  // Toggle save post
  const handleSavePost = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // Toggle like post
  const handleLikePost = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // Get social icon by platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <Github className="w-4 h-4" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Format date safely to prevent hydration issues
  const formatDate = (dateString: string) => {
    // Use a stable date format for SSR consistency
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Filter posts based on tab
  const filteredPosts = useMemo(() => {
    if (!profileData?.posts) return [];

    if (activeTab === "all") return profileData.posts;
    if (activeTab === "projects")
      return profileData.posts.filter((post) => post.type === "project");
    if (activeTab === "events")
      return profileData.posts.filter((post) => post.type === "event");
    return profileData.posts;
  }, [profileData, activeTab]);

  // Stats data
  const stats = useMemo(() => {
    if (!profileData?.posts) return { projects: 0, events: 0, total: 0 };

    const projects = profileData.posts.filter(
      (post) => post.type === "project"
    ).length;
    const events = profileData.posts.filter(
      (post) => post.type === "event"
    ).length;

    return {
      projects,
      events,
      total: projects + events,
    };
  }, [profileData]);

  if (loading) {
    return <LoadingProfileSkeleton />;
  }

  if (error || !profileData) {
    return <ErrorDisplay error={error} />;
  }

  // Safely access user data with null checks
  const displayName = profileData.user.name || profileData.user.username || "";
  const userBio = profileData.user.bio || "";
  const userImage =
    profileData.user.image || "/placeholder.svg?height=128&width=128";
  const userSocialLinks = profileData.user.socialLinks || {};
  const userCreatedAt = profileData.user.createdAt || new Date().toISOString();
  const followersCount = profileData.user._count?.followers || 0;
  const followingCount = profileData.user._count?.following || 0;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col">
        {/* Profile Header */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#1a1a1a] overflow-hidden">
                <Image
                  src={userImage || "/placeholder.svg"}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {displayName}
                  </h1>
                  <p className="text-[#ffcc00]">@{profileData.user.username}</p>

                  {userBio && (
                    <p className="mt-3 text-gray-300 max-w-lg">{userBio}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {currentUser &&
                    profileData.user.id &&
                    currentUser.id !== profileData.user.id && (
                      <FollowButton
                        userId={profileData.user.id}
                        username={profileData.user.username}
                      />
                    )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#333333] text-white hover:bg-[#252525] bg-accent-foreground"
                      onClick={() =>
                        router.push(`/messages?to=${profileData.user.username}`)
                      }
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#333333] text-white hover:bg-[#252525] bg-accent-foreground"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="sr-only">Share</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#333333] text-white hover:bg-[#252525] bg-accent-foreground"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="flex flex-wrap gap-4 mt-4">
                {Object.entries(userSocialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-400 hover:text-[#ffcc00] transition-colors"
                  >
                    {getSocialIcon(platform)}
                    <span className="ml-1 capitalize">{platform}</span>
                  </a>
                ))}

                <div className="flex items-center text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Joined{" "}
                    {new Date(userCreatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{stats.total}</span>
                  <span className="text-gray-400">Posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{stats.projects}</span>
                  <span className="text-gray-400">Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{stats.events}</span>
                  <span className="text-gray-400">Events</span>
                </div>
                <Link
                  href={`/users/${profileData.user.username}/followers`}
                  className="flex items-center gap-1 hover:text-[#ffcc00]"
                >
                  <span className="font-bold text-white">{followersCount}</span>
                  <span className="text-gray-400">Followers</span>
                </Link>
                <Link
                  href={`/users/${profileData.user.username}/following`}
                  className="flex items-center gap-1 hover:text-[#ffcc00]"
                >
                  <span className="font-bold text-white">{followingCount}</span>
                  <span className="text-gray-400">Following</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] overflow-hidden">
          <div className="flex justify-between items-center border-b border-[#333333] px-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-transparent border-b-0 p-0">
                <TabsTrigger
                  value="all"
                  className={`px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#ffcc00] data-[state=active]:text-white data-[state=active]:bg-transparent text-gray-400`}
                >
                  All Posts
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className={`px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#ffcc00] data-[state=active]:text-white data-[state=active]:bg-transparent text-gray-400`}
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className={`px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#ffcc00] data-[state=active]:text-white data-[state=active]:bg-transparent text-gray-400`}
                >
                  Events
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-400 hover:text-white ${
                  viewMode === "grid" ? "text-[#ffcc00]" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-400 hover:text-white ${
                  viewMode === "list" ? "text-[#ffcc00]" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Posts */}
          <div className="p-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {profileData.user.username} hasn&apos;t posted any{" "}
                  {activeTab === "projects"
                    ? "projects"
                    : activeTab === "events"
                    ? "events"
                    : "content"}{" "}
                  yet.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#252525]/90 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333333] hover:border-[#444444] transition-all duration-200"
                  >
                    {post.images && post.images.length > 0 ? (
                      <div className="relative h-40 w-full">
                        <Image
                          src={
                            post.images[0] ||
                            "/placeholder.svg?height=160&width=320"
                          }
                          alt={post.title}
                          fill
                          className="object-cover w-full h-full"
                        />
                        <Badge className="absolute top-2 right-2 bg-[#ffcc00] text-black text-xs font-bold">
                          {post.type}
                        </Badge>
                      </div>
                    ) : (
                      <div className="h-20 bg-gradient-to-r from-[#333333] to-[#252525] flex items-center justify-center">
                        <Badge className="bg-[#ffcc00] text-black text-xs font-bold">
                          {post.type}
                        </Badge>
                      </div>
                    )}

                    <div className="p-4">
                      <Link href={`/${post.type}s/${post.id}`}>
                        <h3 className="text-white font-semibold mb-2 hover:text-[#ffcc00] transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {post.description}
                      </p>

                      {post.type === "event" && post.date && (
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <CalendarDays className="w-4 h-4 mr-2 text-[#ffcc00]" />
                          <span>
                            {new Date(post.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      {post.location && (
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <MapPin className="w-4 h-4 mr-2 text-[#ffcc00]" />
                          <span>{post.location}</span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>

                    <div className="border-t border-[#333333] p-3 flex justify-between">
                      <div className="flex space-x-3">
                        <button
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              likedPosts.includes(post.id)
                                ? "fill-[#ffcc00] text-[#ffcc00]"
                                : ""
                            }`}
                          />
                        </button>
                        <Link
                          href={`/${post.type}s/${post.id}`}
                          className="text-gray-400 hover:text-white"
                        >
                          <MessageSquare className="w-5 h-5" />
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
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#252525]/90 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333333] hover:border-[#444444] transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link href={`/${post.type}s/${post.id}`}>
                            <h3 className="text-white font-semibold hover:text-[#ffcc00] transition-colors">
                              {post.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-[#333333] text-[#ffcc00] hover:bg-[#333333]">
                              {post.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </div>

                        {post.images && post.images.length > 0 && (
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={
                                post.images[0] ||
                                "/placeholder.svg?height=64&width=64"
                              }
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-3">
                        {post.description.length > 200
                          ? `${post.description.substring(0, 200)}...`
                          : post.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.type === "event" && post.date && (
                          <div className="flex items-center text-sm text-gray-400">
                            <CalendarDays className="w-4 h-4 mr-1 text-[#ffcc00]" />
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

                        {post.location && (
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-1 text-[#ffcc00]" />
                            <span>{post.location}</span>
                          </div>
                        )}
                      </div>

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
                    </div>

                    <div className="border-t border-[#333333] p-3 flex justify-between">
                      <div className="flex space-x-3">
                        <button
                          className="text-gray-400 hover:text-white flex items-center gap-1"
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              likedPosts.includes(post.id)
                                ? "fill-[#ffcc00] text-[#ffcc00]"
                                : ""
                            }`}
                          />
                          <span className="text-sm">Like</span>
                        </button>
                        <Link
                          href={`/${post.type}s/${post.id}`}
                          className="text-gray-400 hover:text-white flex items-center gap-1"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm">
                            {post.commentCount > 0 ? post.commentCount : ""}{" "}
                            Comment
                            {post.commentCount !== 1 ? "s" : ""}
                          </span>
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
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function LoadingProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 animate-pulse">
      <div className="flex flex-col">
        {/* Profile Header Skeleton */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image Skeleton */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-700"></div>
            </div>

            {/* Profile Info Skeleton */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="h-7 w-48 bg-gray-700 rounded mb-2"></div>
                  <div className="h-5 w-32 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-700 rounded mb-1"></div>
                  <div className="h-4 w-5/6 bg-gray-700 rounded mb-4"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="h-10 w-24 bg-gray-700 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-gray-700 rounded"></div>
                    <div className="h-9 w-9 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>

              {/* User Details Skeleton */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="h-6 w-24 bg-gray-700 rounded"></div>
                <div className="h-6 w-24 bg-gray-700 rounded"></div>
                <div className="h-6 w-32 bg-gray-700 rounded"></div>
              </div>

              {/* Stats Skeleton */}
              <div className="flex flex-wrap gap-6 mt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="h-5 w-8 bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] overflow-hidden">
          <div className="flex border-b border-[#333333]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-3 flex-1">
                <div className="h-5 bg-gray-700 rounded mx-auto w-20"></div>
              </div>
            ))}
          </div>

          {/* Posts Skeleton */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#252525]/90 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333333]"
                >
                  <div className="h-40 bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-5 w-3/4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 w-5/6 bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 w-20 bg-gray-700 rounded"></div>
                  </div>
                  <div className="border-t border-[#333333] p-3 flex justify-between">
                    <div className="flex space-x-3">
                      <div className="h-5 w-5 bg-gray-700 rounded"></div>
                      <div className="h-5 w-5 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error display component
function ErrorDisplay({ error }: { error: string | null }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md text-center border border-[#333333]">
        <h2 className="text-xl font-bold text-red-400">Profile Not Found</h2>
        <p className="text-gray-400 mt-4">
          {error ||
            "The user profile you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-4 py-2 bg-[#ffcc00] text-black rounded-md hover:bg-[#e6b800]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
