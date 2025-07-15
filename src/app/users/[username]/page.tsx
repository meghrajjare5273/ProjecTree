/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type User from "@/types/users";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

interface typedUser {
  id: string;
  name: string;
  username: string;
  image: string;
  bio: string;
  socialLinks: string;
  location: string;
  interests: string[];
  skills: string[];
  createdAt: string;
  _count: {
    followers: number;
    following: number;
  };
}

// Import dashboard components to reuse the layout
const LeftSidebar = dynamic(
  () => import("../../dashboard/_components/LeftSidebar"),
  {
    ssr: false,
  }
);
const RightSidebar = dynamic(
  () => import("../../dashboard/_components/RightSidebar"),
  {
    ssr: false,
  }
);
const Navbar = dynamic(() => import("../../dashboard/_components/Navbar"), {
  ssr: false,
});

// Import profile-specific components
import ProfileHeader from "./_components/ProfileHeader";
import ProfileContent, { ProfilePost } from "./_components/ProfileContent";
import Post, { Event, ExtendedPost, Project } from "@/types/posts";
import { SearchDialog } from "@/components/ui/search-dialog";

// Fetcher function
// const fetcher = (url: string) =>
//   fetch(url, { credentials: "include" }).then((res) => res.json());

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<typedUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [stats, setStats] = useState({ projects: 0, events: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState<string>("");

  // Get username from params
  useEffect(() => {
    const getUsername = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };
    getUsername();
  }, [params]);

  // Check session and fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;

      try {
        // Check session
        const session = await authClient.getSession();
        if (!session) {
          router.push("/auth?mode=signin");
          return;
        }

        // Fetch current user profile for sidebar
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
        });
        const profileData = await profileResponse.json();
        setUser(profileData.user);

        // Fetch target user data
        const userResponse = await fetch(`/api/users/${username}`, {
          credentials: "include",
        });
        if (!userResponse.ok) {
          router.push("/404");
          return;
        }

        const userData = await userResponse.json();
        const targetUser = userData.data;

        // Transform user data for profile header
        const transformedUser = {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username || "",
          image: targetUser.image,
          bio: targetUser.bio,
          socialLinks: targetUser.socialLinks || {},
          location: targetUser.location,
          interests: targetUser.interests || [],
          skills: targetUser.skills || [],
          createdAt: targetUser.createdAt,
          _count: targetUser._count,
        };

        setProfileUser(transformedUser);

        // Transform posts data
        const transformedPosts = [
          ...(targetUser.projects || []).map((project: Project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            type: "project" as const,
            images: project.images,
            tags: project.tags,
            createdAt: project.createdAt,
            commentCount: project.comments?.length || 0,
            user: {
              username: targetUser.username || "",
              image: targetUser.image,
            },
          })),
          ...(targetUser.events || []).map((event: Event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            type: "event" as const,
            images: event.images,
            date: event.date,
            location: event.location,
            createdAt: event.createdAt,
            commentCount: event.comments?.length || 0,
            user: {
              username: targetUser.username || "",
              image: targetUser.image,
            },
          })),
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPosts(transformedPosts);

        // Calculate stats
        const calculatedStats = {
          projects: targetUser.projects?.length || 0,
          events: targetUser.events?.length || 0,
          total:
            (targetUser.projects?.length || 0) +
            (targetUser.events?.length || 0),
        };

        setStats(calculatedStats);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, router]);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Trending topics (simulated)
  const trendingTopics = [
    "Hackathon",
    "AI Projects",
    "Web Development",
    "Mobile Apps",
    "Design",
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#121212]">
        {/* Loading skeleton matching dashboard layout */}
        <div className="fixed top-0 left-0 z-40 w-[280px] h-screen bg-[#1a1a1a] border-r border-[#333333]">
          <div className="p-6 flex items-center justify-center">
            <div className="h-8 w-40 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <main className="flex-1 ml-[280px]">
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333] py-4 px-6">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-gray-400">
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#121212]">
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

      {/* Left Sidebar - Reuse from dashboard */}
      <LeftSidebar
        user={user}
        mobileSidebarOpen={mobileSidebarOpen}
        closeMobileSidebar={closeMobileSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Navbar - Reuse from dashboard but customize title */}
        <header className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333] py-4 px-6 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="ml-8 md:ml-0 flex-1">
              <h1 className="text-white text-xl md:text-2xl font-bold">
                @{profileUser.username}
              </h1>
              <p className="text-gray-400 text-sm">
                {profileUser.name || profileUser.username}&apos;s Profile
              </p>
            </div>

            {/* Search Bar */}
            {/* Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center">
                      <div className="relative w-full max-w-md">
                        <SearchDialog />
                      </div>
                    </div>
            

            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* Navigation buttons can be added here */}
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Content */}
            <div className="flex-1 order-2 md:order-1">
              <ProfileHeader
                user={profileUser}
                currentUserId={user?.id || null}
                stats={stats}
              />
              <ProfileContent posts={posts} username={profileUser.username} />
            </div>

            {/* Right Sidebar - Reuse from dashboard */}
            <div className="w-full md:w-80 order-1 md:order-2">
              <RightSidebar user={user} trendingTopics={trendingTopics} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
