/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
// import { authClient } from "@/lib/auth-client";

interface FollowButtonProps {
  userId: string; // The ID of the user to follow/unfollow
  username: string; // The username for profile cache key
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function FollowButton({ userId, username }: FollowButtonProps) {
  const { data, error, mutate } = useSWR(
    `/api/follows?followingId=${userId}`,
    fetcher
  );
  const { mutate: globalMutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  if (error) return <div>Error loading follow status</div>;
  if (!data) return <button disabled>Loading...</button>;

  const isFollowing = data.isFollowing;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        // Optimistically update to unfollowed
        mutate({ isFollowing: false }, false);
        globalMutate(
          `/api/users/${username}`,
          (user: any) => {
            if (user?.data) {
              return {
                ...user,
                data: {
                  ...user.data,
                  _count: {
                    ...user.data._count,
                    followers: user.data._count.followers - 1,
                  },
                },
              };
            }
            return user;
          },
          false
        );

        await fetch("/api/follows", {
          method: "DELETE",
          body: JSON.stringify({ followingId: userId }),
        });

        // Revalidate after success
        mutate();
        globalMutate(`/api/users/${username}`);
      } else {
        // Optimistically update to followed
        mutate({ isFollowing: true }, false);
        globalMutate(
          `/api/users/${username}`,
          (user: any) => {
            if (user?.data) {
              return {
                ...user,
                data: {
                  ...user.data,
                  _count: {
                    ...user.data._count,
                    followers: user.data._count.followers + 1,
                  },
                },
              };
            }
            return user;
          },
          false
        );

        await fetch("/api/follows", {
          method: "POST",
          body: JSON.stringify({ followingId: userId }),
        });

        // Revalidate after success
        mutate();
        globalMutate(`/api/users/${username}`);
      }
    } catch (error) {
      // Revert on error
      mutate({ isFollowing }, false);
      globalMutate(`/api/users/${username}`, null, true);
      console.error("Error following/unfollowing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded-full ${
        isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"
      }`}
    >
      {isLoading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
