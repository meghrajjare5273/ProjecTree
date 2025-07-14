"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import useSWR from "swr";
import type User from "@/types/users";

// Import components
import LeftSidebar from "./_components/LeftSidebar";
import ProfileNavbar from "./_components/Navbar";
import ProfileMainContent from "./_components/ProfileContent";
import ProfileRightSidebar from "./_components/RightSidebar";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setUsername(resolvedParams.username);
    });
  }, [params]);

  // Fetch profile user data
  const { data, error } = useSWR(
    username ? `/api/users/${username}` : null,
    fetcher
  );

  // Check session
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" }).then((res) => {
      if (!res.ok) {
        router.push("/auth?mode=signin");
      }
    });
  }, [router]);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Handle loading and error states
  if (!username) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
          <p className="text-gray-400">
            The user @{username} could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  const profileUser = data.user;
  const posts = data.posts || [];
  const stats = data.stats || { projects: 0, events: 0, total: 0 };

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#1a1a1a] text-white p-2 rounded-full"
        aria-label="Toggle sidebar"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`${
          mobileSidebarOpen ? "fixed inset-0 z-40 bg-black/70" : "hidden"
        } md:hidden`}
        onClick={toggleMobileSidebar}
      />

      {/* Left Sidebar */}
      <LeftSidebar mobileSidebarOpen={mobileSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1">
        <ProfileNavbar user={profileUser} />
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            <ProfileMainContent posts={posts} username={profileUser.username} />
            <ProfileRightSidebar user={profileUser} stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
}
