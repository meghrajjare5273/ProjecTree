/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Layers, Calendar } from "lucide-react";
import type User from "@/types/users";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

interface RightSidebarProps {
  user: User | null;
  trendingTopics: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function RightSidebar({
  user,
  trendingTopics,
}: RightSidebarProps) {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await fetch("/api/suggested-users", {
          credentials: "include",
        });
        const data = await res.json();
        setSuggestedUsers(data.users);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load suggested users");
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
    // console.log(suggestedUsers);
  }, []);

  return (
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
          <h3 className="text-white font-medium mb-4">Suggested Users</h3>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-gray-500">Loading suggested users...</p>
            ) : error ? (
              <p className="text-red-500">Failed to load suggested users</p>
            ) : suggestedUsers && suggestedUsers.length > 0 ? (
              suggestedUsers.map((user: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 border border-[#333333]">
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    </Avatar>
                    <div className="ml-3">
                      <Link
                        href={`/users/${user.username}`}
                        className="text-white text-sm font-medium"
                      >
                        {user.name}
                      </Link>
                      <p className="text-gray-500 text-xs">{user.username}</p>
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
              ))
            ) : (
              <p className="text-gray-500">No suggested users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
