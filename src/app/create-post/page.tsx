"use client";

import { useEffect, useState } from "react";
import PostFormHeader from "./_components/PostFormHeader";
import PostFormContainer from "./_components/PostFormContainer";
import type User from "@/types/users";

export default function CreatePost() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [postType, setPostType] = useState<"project" | "event">("project");
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <PostFormHeader postType={postType} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <PostFormContainer user={user} />
      </main>
    </div>
  );
}
