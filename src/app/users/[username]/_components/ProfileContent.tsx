"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Grid,
  LayoutList,
  Heart,
  MessageSquare,
  Bookmark,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Post {
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
}

interface ProfileContentProps {
  posts: Post[];
  username: string;
}

export default function ProfileContent({
  posts,
  username,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

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

  // Format date safely to prevent hydration issues
  const formatDate = (dateString: string) => {
    // Use a stable date format for SSR consistency
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Filter posts based on tab
  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return posts;
    if (activeTab === "projects")
      return posts.filter((post) => post.type === "project");
    if (activeTab === "events")
      return posts.filter((post) => post.type === "event");
    return posts;
  }, [posts, activeTab]);

  return (
    <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] overflow-hidden">
      <div className="flex justify-between items-center border-b border-[#333333] px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              {username} hasn&apos;t posted any{" "}
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
                        "/placeholder.svg?height=160&width=320" ||
                        "/placeholder.svg"
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
                            "/placeholder.svg?height=64&width=64" ||
                            "/placeholder.svg"
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
                          {new Date(post.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
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
                        {post.commentCount > 0 ? post.commentCount : ""} Comment
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
  );
}
