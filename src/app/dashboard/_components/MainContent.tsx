"use client";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Filter,
  Heart,
  MessageSquare,
  Bookmark,
  Calendar,
  Clock,
} from "lucide-react";
import type Post from "@/types/posts";

// UI Components
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface MainContentProps {
  isLoading: boolean;
  error: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredPosts: Post[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedPosts: string[];
  likedPosts: string[];
  handleSavePost: (postId: string) => void;
  handleLikePost: (postId: string) => void;
}

export default function MainContent({
  isLoading,
  error,
  activeTab,
  setActiveTab,
  filteredPosts,
  searchQuery,
  setSearchQuery,
  savedPosts,
  likedPosts,
  handleSavePost,
  handleLikePost,
}: MainContentProps) {
  // Format date
  const formatDate = (dateString: Date) => {
    return formatDistanceToNow(dateString, { addSuffix: true });
  };

  // Helper function to get post image safely
  const getPostImage = (post: Post) => {
    // Check if images is an array and has items
    if (Array.isArray(post.images) && post.images.length > 0) {
      return post.images[0];
    }
    // Check if image is directly on the post (might be the case for events)
    else if (post.images) {
      return post.images[1];
    }
    // Fallback to placeholder
    return "/placeholder.svg?height=256&width=512";
  };

  return (
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
          {filteredPosts.length} {activeTab === "all" ? "Posts" : activeTab}
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
      ) : error ? (
        <Card className="bg-[#1a1a1a] border-[#333333] p-6 text-center">
          <h3 className="text-xl font-semibold text-red-400">
            Error Loading Data
          </h3>
          <p className="text-gray-400 mt-2">
            There was a problem fetching your content. Please try again later.
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
          <h3 className="text-xl font-semibold text-white">No Posts Found</h3>
          <p className="text-gray-400 mt-2">
            {activeTab === "saved"
              ? "You haven't saved any posts yet."
              : searchQuery
              ? "No results match your search."
              : `No ${activeTab === "all" ? "posts" : activeTab} available.`}
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority
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
                        {formatDate(new Date(post.createdAt))}
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
                    <div className="flex justify-normal text-sm text-gray-400 mb-3">
                      <Calendar className="w-4 h-4 mr-2 text-[#ffcc00]" />
                      <span>
                        {new Date(post.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-end justify-normal text-sm text-gray-400 mb-3">
                      <Clock className="w-4 h-4 mr-2 text-[#ffcc00]" />
                      <span>
                        {new Date(post.date).toLocaleTimeString(undefined, {
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Updated image display logic to handle both structures */}
                {(post.images?.length > 0 || post.images) && (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={getPostImage(post)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority
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
  );
}
