"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import errorMap from "zod/locales/en.js";

interface FollowButtonProps {
  initialIsFollowing: boolean;
  userId: string;
}

export function FollowButton({
  initialIsFollowing,
  userId,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  //   const { toast } = useToast();

  const handleFollow = async () => {
    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      });
      if (!response.ok) throw new Error("Failed to follow");
      setIsFollowing(true);
      toast.success("Followed successfully");
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch("/api/follows", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      });
      if (!response.ok) throw new Error("Failed to unfollow");
      setIsFollowing(false);
      toast.success("Unfollowed successfully");
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  return (
    <Button onClick={isFollowing ? handleUnfollow : handleFollow}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
