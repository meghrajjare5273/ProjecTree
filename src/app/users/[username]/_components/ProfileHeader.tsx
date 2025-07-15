/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Github, Linkedin, Twitter, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/follow-button";
import { Card } from "@/components/ui/card";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    bio: string | null;
    socialLinks: any;
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

export default function ProfileHeader({
  user,
  currentUserId,
  stats,
}: ProfileHeaderProps) {
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

  const displayName = user.name || user.username || "";
  const userBio = user.bio || "";
  const userImage = user.image || "/placeholder.svg?height=128&width=128";
  const userSocialLinks = user.socialLinks || {};
  const userCreatedAt = user.createdAt || new Date().toISOString();
  const followersCount = user._count?.followers || 0;
  const followingCount = user._count?.following || 0;

  return (
    <Card className="bg-[#1a1a1a] border-[#333333] p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image */}
        <div className="relative">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#ffcc00]/20 overflow-hidden">
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
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {displayName}
              </h1>
              <p className="text-[#ffcc00] text-sm md:text-base">
                @{user.username}
              </p>

              {userBio && (
                <p className="mt-3 text-gray-300 text-sm md:text-base max-w-lg">
                  {userBio}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {currentUserId && user.id && currentUserId !== user.id && (
                <FollowButton userId={user.id} username={user.username} />
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#333333] text-white hover:bg-[#252525] bg-transparent"
                >
                  Message
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#333333] text-white hover:bg-[#252525] bg-transparent"
                >
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {Object.entries(userSocialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-[#ffcc00] transition-colors"
              >
                {getSocialIcon(platform)}
                <span className="ml-1 capitalize">{platform}</span>
              </a>
            ))}

            {user.location && (
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{user.location}</span>
              </div>
            )}

            <div className="flex items-center text-gray-400">
              <span>
                Joined{" "}
                {new Date(userCreatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {/* Skills & Interests */}
          {(user.skills.length > 0 || user.interests.length > 0) && (
            <div className="mt-4 space-y-3">
              {user.skills.length > 0 && (
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.slice(0, 8).map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-[#252525] text-gray-300 hover:bg-[#333333] text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 8 && (
                      <Badge className="bg-[#252525] text-gray-300 hover:bg-[#333333] text-xs">
                        +{user.skills.length - 8} more
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
                        className="bg-[#252525]/80 text-yellow-400 hover:bg-[#333333] text-xs"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {user.interests.length > 8 && (
                      <Badge className="bg-[#252525]/80 text-yellow-400 hover:bg-[#333333] text-xs">
                        +{user.interests.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
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
              href={`/users/${user.username}/followers`}
              className="flex items-center gap-1 hover:text-[#ffcc00] transition-colors"
            >
              <span className="font-bold text-white">{followersCount}</span>
              <span className="text-gray-400">Followers</span>
            </Link>
            <Link
              href={`/users/${user.username}/following`}
              className="flex items-center gap-1 hover:text-[#ffcc00] transition-colors"
            >
              <span className="font-bold text-white">{followingCount}</span>
              <span className="text-gray-400">Following</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
