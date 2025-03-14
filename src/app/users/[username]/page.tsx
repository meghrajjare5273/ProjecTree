"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Icons
import {
  Calendar,
  Bookmark,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Mail,
} from "lucide-react";

// Types
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
  user: {
    username: string;
    image: string | null;
  };
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

export default function UserProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [following, setFollowing] = useState(false);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  // Fetch profile data
  useEffect(() => {
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
  }, [username]);

  // Simulate saved and liked posts (would come from API in real app)
  useEffect(() => {
    // Simulated saved and liked posts
    const mockSaved = ["1", "3", "5"];
    const mockLiked = ["2", "4", "6"];
    setSavedPosts(mockSaved);
    setLikedPosts(mockLiked);
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

  // Toggle following
  const handleFollowToggle = () => {
    setFollowing(!following);
  };

  // Get social icon by platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <Github className="w-5 h-5" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Filter posts based on tab
  const filteredPosts = useMemo(() => {
    if (!profileData) return [];

    if (activeTab === "all") return profileData.posts;
    if (activeTab === "projects")
      return profileData.posts.filter((post) => post.type === "project");
    if (activeTab === "events")
      return profileData.posts.filter((post) => post.type === "event");
    return profileData.posts;
  }, [profileData, activeTab]);

  // Stats data
  const stats = useMemo(() => {
    if (!profileData) return { projects: 0, events: 0, total: 0 };

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

  return (
    <div className="min-h-screen bg-[#121212]">
      {loading ? (
        <LoadingProfileSkeleton />
      ) : error || !profileData ? (
        <ErrorDisplay error={error} />
      ) : (
        <div>
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-700">
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
            </div>

            {/* Profile Info */}
            <div className="max-w-5xl mx-auto px-4 relative -mt-16">
              <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] overflow-visible">
                <div className="p-6 pt-0">
                  {/* Avatar */}
                  <div className="avatar w-32 h-32 -mt-16 mb-4 border-4 border-[#1a1a1a] rounded-full overflow-hidden">
                    <Image
                      src={
                        profileData.user.image ||
                        "/placeholder.svg?height=128&width=128"
                      }
                      alt={profileData.user.name || profileData.user.username}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {profileData.user.name || profileData.user.username}
                      </h1>
                      <p className="text-[#ffcc00]">
                        @{profileData.user.username}
                      </p>

                      {profileData.user.bio && (
                        <p className="mt-3 text-gray-300">
                          {profileData.user.bio}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-4">
                        {Object.entries(profileData.user.socialLinks || {}).map(
                          ([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-400 hover:text-white"
                            >
                              {getSocialIcon(platform)}
                              <span className="ml-1 capitalize">
                                {platform}
                              </span>
                            </a>
                          )
                        )}

                        <div className="flex items-center text-gray-400">
                          <Calendar className="w-5 h-5 mr-1" />
                          <span>
                            Joined{" "}
                            {new Date(
                              profileData.user.createdAt
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                      <button
                        onClick={handleFollowToggle}
                        className={
                          following
                            ? "bg-transparent border border-[#ffcc00] text-[#ffcc00] px-4 py-2 rounded-md hover:bg-[#ffcc00]/10"
                            : "bg-[#ffcc00] text-black px-4 py-2 rounded-md hover:bg-[#e6b800]"
                        }
                      >
                        {following ? "Following" : "Follow"}
                      </button>

                      <div className="flex gap-2">
                        <button className="border border-[#333333] text-white p-2 rounded-md hover:bg-[#333333]">
                          <Mail className="w-5 h-5" />
                        </button>
                        <button className="border border-[#333333] text-white p-2 rounded-md hover:bg-[#333333]">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-[#252525] rounded-md p-4 text-center">
                      <p className="text-2xl font-bold text-[#ffcc00]">
                        {stats.total}
                      </p>
                      <p className="text-gray-400">Posts</p>
                    </div>
                    <div className="bg-[#252525] rounded-md p-4 text-center">
                      <p className="text-2xl font-bold text-[#ffcc00]">
                        {stats.projects}
                      </p>
                      <p className="text-gray-400">Projects</p>
                    </div>
                    <div className="bg-[#252525] rounded-md p-4 text-center">
                      <p className="text-2xl font-bold text-[#ffcc00]">
                        {stats.events}
                      </p>
                      <p className="text-gray-400">Events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="max-w-5xl mx-auto px-4 mt-6">
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] overflow-hidden">
              <div className="flex border-b border-[#333333]">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-3 flex-1 text-center ${
                    activeTab === "all"
                      ? "border-b-2 border-[#ffcc00] text-white"
                      : "text-gray-400"
                  }`}
                >
                  All Posts ({profileData.posts.length})
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`px-4 py-3 flex-1 text-center ${
                    activeTab === "projects"
                      ? "border-b-2 border-[#ffcc00] text-white"
                      : "text-gray-400"
                  }`}
                >
                  Projects ({stats.projects})
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-4 py-3 flex-1 text-center ${
                    activeTab === "events"
                      ? "border-b-2 border-[#ffcc00] text-white"
                      : "text-gray-400"
                  }`}
                >
                  Events ({stats.events})
                </button>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-[#252525] rounded-lg overflow-hidden border border-[#333333]"
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
                              className="object-cover"
                            />
                            <span className="absolute top-2 right-2 bg-[#ffcc00] text-black text-xs font-bold px-2 py-0.5 rounded">
                              {post.type}
                            </span>
                          </div>
                        ) : (
                          <div className="h-20 bg-gradient-to-r from-[#333333] to-[#252525] flex items-center justify-center">
                            <span className="bg-[#ffcc00] text-black text-xs font-bold px-2 py-0.5 rounded">
                              {post.type}
                            </span>
                          </div>
                        )}

                        <div className="p-4">
                          <Link href={`/${post.type}s/${post.id}`}>
                            <h3 className="text-white font-semibold mb-2 hover:text-[#ffcc00]">
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading skeleton component
function LoadingProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="h-48 bg-gray-800"></div>

      {/* Profile Info Skeleton */}
      <div className="max-w-5xl mx-auto px-4 relative -mt-16">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] overflow-hidden">
          <div className="p-6 pt-0">
            {/* Avatar Skeleton */}
            <div className="w-32 h-32 -mt-16 mb-4 rounded-full bg-gray-700"></div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <div className="h-7 w-48 bg-gray-700 rounded mb-2"></div>
                <div className="h-5 w-32 bg-gray-700 rounded mb-4"></div>

                <div className="h-4 w-full bg-gray-700 rounded mb-1"></div>
                <div className="h-4 w-5/6 bg-gray-700 rounded mb-4"></div>

                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-6 w-32 bg-gray-700 rounded"></div>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                <div className="h-10 w-24 bg-gray-700 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-gray-700 rounded"></div>
                  <div className="h-9 w-9 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#252525] rounded-md p-4">
                  <div className="h-8 w-12 bg-gray-700 rounded mx-auto mb-2"></div>
                  <div className="h-4 w-16 bg-gray-700 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] overflow-hidden">
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
                  className="bg-[#252525] rounded-lg overflow-hidden border border-[#333333]"
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
