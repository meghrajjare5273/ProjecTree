"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import useSWR from "swr";
import type User from "@/types/users";

// Import components
import LeftSidebar from "./LeftSidebar";
import ProfileNavbar from "./Navbar";
import ProfileMainContent from "./ProfileContent";
import ProfileRightSidebar from "./RightSidebar";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

interface UserProfileClientProps {
  username: string;
}

export default function UserProfileClient({
  username,
}: UserProfileClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch current user profile with error handling
  const { data: profileData, error: profileError } = useSWR(
    isClient ? "/api/profile" : null,
    fetcher,
    {
      onError: (error) => {
        console.error("Profile fetch error:", error);
      },
    }
  );

  // Fetch profile user data with error handling
  const { data: profileUserData, error: profileUserError } = useSWR(
    isClient && username ? `/api/users/${username}` : null,
    fetcher,
    {
      onError: (error) => {
        console.error("Profile user fetch error:", error);
      },
    }
  );

  // Check session and redirect if not authenticated
  useEffect(() => {
    if (!isClient) return;

    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (!session) {
          router.push("/auth?mode=signin");
        }
      } catch (error) {
        console.error("Session check error:", error);
        router.push("/auth?mode=signin");
      }
    };

    checkSession();
  }, [router, isClient]);

  // Set user data when profile data is available
  useEffect(() => {
    if (profileData?.user) {
      setUser(profileData.user);
    }
  }, [profileData]);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar when clicking on a link
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Handle loading and error states
  if (!isClient) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-400">Please try signing in again.</p>
        </div>
      </div>
    );
  }

  if (profileUserError) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
          <p className="text-gray-400">
            The user @{username} could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Enhanced loading check - ensure both data and user object exist
  if (!profileUserData || !profileUserData.user) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const profileUser = profileUserData.user;
  const posts = profileUserData.posts || [];
  const stats = profileUserData.stats || { projects: 0, events: 0, total: 0 };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#1a1a1a] text-white p-2 rounded-full shadow-lg"
        aria-label="Toggle sidebar"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`${
          mobileSidebarOpen
            ? "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            : "hidden"
        } md:hidden`}
        onClick={toggleMobileSidebar}
      ></div>

      {/* Left Sidebar */}
      <LeftSidebar
        user={user}
        mobileSidebarOpen={mobileSidebarOpen}
        closeMobileSidebar={closeMobileSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Navbar */}
        <ProfileNavbar user={user} profileUser={profileUser} />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <ProfileMainContent
              posts={posts}
              username={profileUser?.username || username}
            />

            {/* Right Sidebar */}
            <ProfileRightSidebar
              user={profileUser}
              currentUserId={user?.id || null}
              stats={stats}
            />
          </div>
        </div>
      </main>
    </>
  );
}
