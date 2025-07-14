"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/follow-button";
import type { JsonArray, JsonObject } from "@prisma/client/runtime/library";

interface ProfileRightSidebarProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    bio: string | null;
    socialLinks: string | number | boolean | JsonObject | JsonArray;
    location?: string | null;
    interests: string[];
    skills: string[];
    createdAt: string;
    _count?: {
      followers: number;
      following: number;
    };
  };
  currentUserId: string | null;
  stats: {
    projects: number;
    events: number;
    total: number;
  };
}

export default function ProfileRightSidebar({
  user,
  currentUserId,
  stats,
}: ProfileRightSidebarProps) {
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

  const displayName = user.name || user.username || "";
  const userBio = user.bio || "";
  const userImage = user.image || "/placeholder.svg?height=120&width=120";
  const userSocialLinks = user.socialLinks || {};
  const userCreatedAt = user.createdAt || new Date().toISOString();
  const followersCount = user._count?.followers || 0;
  const followingCount = user._count?.following || 0;

  return (
    <div className="w-full md:w-80 order-1 md:order-2 space-y-6">
      {/* Profile Info Card */}
      <Card className="bg-[#1a1a1a] border-[#333333]">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.3)]">
              <Image
                src={userImage || "/placeholder.svg"}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-[#ffcc00] text-sm mb-3">@{user.username}</p>

            {userBio && (
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {userBio}
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-4 w-full">
              <div className="text-center">
                <p className="text-[#ffcc00] font-bold text-lg">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-[#ffcc00] font-bold text-lg">
                  {stats.projects}
                </p>
                <p className="text-xs text-gray-400">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-[#ffcc00] font-bold text-lg">
                  {stats.events}
                </p>
                <p className="text-xs text-gray-400">Events</p>
              </div>
            </div>

            <div className="flex justify-center gap-6 mb-4 w-full">
              <Link
                href={`/users/${user.username}/followers`}
                className="text-center hover:text-[#ffcc00] transition-colors"
              >
                <p className="text-white font-bold text-lg">{followersCount}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </Link>
              <Link
                href={`/users/${user.username}/following`}
                className="text-center hover:text-[#ffcc00] transition-colors"
              >
                <p className="text-white font-bold text-lg">{followingCount}</p>
                <p className="text-xs text-gray-400">Following</p>
              </Link>
            </div>

            {/* Action Buttons */}
            {currentUserId && user.id && currentUserId !== user.id && (
              <div className="flex flex-col gap-2 w-full">
                <FollowButton userId={user.id} username={user.username} />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#333333] text-white hover:bg-[#252525] bg-transparent"
                  >
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#333333] text-white hover:bg-[#252525] bg-transparent"
                  >
                    Share
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card className="bg-[#1a1a1a] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Social Links */}
          {Object.entries(userSocialLinks).map(([platform, url]) => (
            <a
              key={platform}
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 hover:text-[#ffcc00] transition-colors"
            >
              {getSocialIcon(platform)}
              <span className="capitalize">{platform}</span>
            </a>
          ))}

          {/* Location */}
          {user.location && (
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}

          {/* Join Date */}
          <div className="flex items-center gap-3 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              Joined{" "}
              {new Date(userCreatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      {(user.skills.length > 0 || user.interests.length > 0) && (
        <Card className="bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Skills & Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.skills.length > 0 && (
              <div>
                <h3 className="text-white text-sm font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.slice(0, 10).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#252525] text-gray-300 hover:bg-[#333333] text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {user.skills.length > 10 && (
                    <Badge
                      variant="outline"
                      className="text-xs text-gray-400 border-[#333333]"
                    >
                      +{user.skills.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {user.interests.length > 0 && (
              <div>
                <h3 className="text-white text-sm font-medium mb-2">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.slice(0, 8).map((interest, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-[#252525]/50 text-[#ffcc00] border-[#ffcc00]/30 hover:bg-[#333333] text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {user.interests.length > 8 && (
                    <Badge
                      variant="outline"
                      className="text-xs text-gray-400 border-[#333333]"
                    >
                      +{user.interests.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
