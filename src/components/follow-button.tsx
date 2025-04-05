/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";

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

  // Show loading state if data is not loaded yet
  if (!data)
    return (
      <button
        disabled
        className="px-4 py-2 rounded-full bg-gray-600 text-white opacity-50"
      >
        Loading...
      </button>
    );

  const isFollowing = data.isFollowing;

  if (error) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-full bg-gray-600 text-white opacity-50"
      >
        {error || "Error Loading Follow Status"}
      </button>
    );
  }

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
      className={`px-4 py-2 rounded-full transition-all duration-300 ${
        isFollowing
          ? "bg-gray-800 text-white hover:bg-gray-700"
          : "bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
      }`}
    >
      {isLoading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
