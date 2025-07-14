"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Filter,
  Heart,
  MessageSquare,
  Bookmark,
  Calendar,
  Clock,
  Grid,
  List,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

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

interface ProfileMainContentProps {
  posts: Post[];
  username: string;
}

export default function ProfileMainContent({
  posts,
  username,
}: ProfileMainContentProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const handleSavePost = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleLikePost = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getPostImage = (post: Post) => {
    if (Array.isArray(post.images) && post.images.length > 0) {
      return post.images[0];
    }
    return "/placeholder.svg?height=256&width=512";
  };

  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return posts;
    if (activeTab === "projects")
      return posts.filter((post) => post.type === "project");
    if (activeTab === "events")
      return posts.filter((post) => post.type === "event");
    return posts;
  }, [posts, activeTab]);

  return (
    <div className="flex-1 order-2 md:order-1">
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
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-white font-medium">
          {filteredPosts.length} {activeTab === "all" ? "Posts" : activeTab}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#333333] text-gray-300 hover:bg-[#252525] hover:text-white bg-transparent"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="flex border border-[#333333] rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 rounded-none border-r border-[#333333] ${
                viewMode === "list"
                  ? "text-[#ffcc00] bg-[#252525]"
                  : "text-gray-400"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 rounded-none ${
                viewMode === "grid"
                  ? "text-[#ffcc00] bg-[#252525]"
                  : "text-gray-400"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredPosts.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-[#333333] p-6 text-center">
          <h3 className="text-xl font-semibold text-white">No Posts Found</h3>
          <p className="text-gray-400 mt-2">
            {username} hasn&apos;t shared any{" "}
            {activeTab === "projects"
              ? "projects"
              : activeTab === "events"
              ? "events"
              : "content"}{" "}
            yet.
          </p>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-[#1a1a1a] border-[#333333] overflow-hidden hover:border-[#444444] transition-colors"
            >
              {post.images && post.images.length > 0 && (
                <div className="relative h-40 w-full">
                  <Image
                    src={getPostImage(post) || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-[#ffcc00] text-black text-xs">
                    {post.type}
                  </Badge>
                </div>
              )}
              <CardContent className="p-4">
                <Link href={`/${post.type}s/${post.id}`}>
                  <h3 className="text-white font-semibold mb-2 hover:text-[#ffcc00] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {post.description}
                </p>

                {post.type === "event" && post.date && (
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <Calendar className="w-3 h-3 mr-1 text-[#ffcc00]" />
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
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <MapPin className="w-3 h-3 mr-1 text-[#ffcc00]" />
                    <span>{post.location}</span>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-2">
                  {formatDate(post.createdAt)}
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#333333] p-3 flex justify-between">
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-[#252525] p-1"
                    onClick={() => handleLikePost(post.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedPosts.includes(post.id)
                          ? "fill-[#ffcc00] text-[#ffcc00]"
                          : ""
                      }`}
                    />
                  </Button>
                  <Link href={`/${post.type}s/${post.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-[#252525] p-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-[#252525] p-1"
                  onClick={() => handleSavePost(post.id)}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      savedPosts.includes(post.id)
                        ? "fill-[#ffcc00] text-[#ffcc00]"
                        : ""
                    }`}
                  />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
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
                          {post.user.username?.charAt(0).toUpperCase() || "U"}
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
                  <div>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <Calendar className="w-4 h-4 mr-2 text-[#ffcc00]" />
                      <span>
                        {new Date(post.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <Clock className="w-4 h-4 mr-2 text-[#ffcc00]" />
                      <span>
                        {new Date(post.date).toLocaleTimeString(undefined, {
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {post.location && (
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-[#ffcc00]" />
                    <span>{post.location}</span>
                  </div>
                )}

                {post.images && post.images.length > 0 && (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={getPostImage(post) || "/placeholder.svg"}
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
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
