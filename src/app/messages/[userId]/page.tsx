/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ChatComponent from "../_components/Chat";
import { useEffect, useState } from "react";
import { getSessionData } from "../_utils";
import { redirect } from "next/navigation";

export default function MessagesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [currUser, setCurrUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the user data when the component mounts
    const currentUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { userId } = await params;
        if (!userId) {
          throw new Error("User ID is required");
        }

        const session = await getSessionData();
        if (!session) {
          throw new Error("User not found");
          redirect("/auth?mode=signin");
        }

        setCurrUser(session.user);
      } catch (err) {
        console.error("Error loading user:", err);
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    currentUser();
  }, [params]); // Remove currUser from dependencies to prevent infinite loop

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Only render ChatComponent when currUser is available
  if (!currUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-gray-600">
          <p>No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <ChatComponent currentUser={currUser} />
    </div>
  );
}
