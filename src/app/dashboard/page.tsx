"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import type User from "@/types/users";
import type Post from "@/types/posts";
import type { Event, Project } from "@/types/posts";

// Components
import Navbar from "./_components/Navbar";
import MainContent from "./_components/MainContent";
import RightSidebar from "./_components/RightSidebar";
import LeftSidebar from "./_components/LeftSidebar";
// Icons
import { Menu, X } from "lucide-react";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data using SWR
  const { data: profileData, error: profileError } = useSWR(
    "/api/profile",
    fetcher
  );
  const { data: projectsData, error: projectsError } = useSWR(
    "/api/projects",
    fetcher
  );
  const { data: eventsData, error: eventsError } = useSWR(
    "/api/events",
    fetcher
  );

  // Check session and redirect if not authenticated
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.push("/auth?mode=signin");
      }
    };
    checkSession();
  }, [router]);

  // Set user data when profile data is available
  useEffect(() => {
    if (profileData) {
      setUser(profileData.user);
    }
  }, [profileData]);

  // Simulate saved and liked posts (would come from API in real app)
  useEffect(() => {
    // Simulated saved and liked posts
    const mockSaved = ["1", "3", "5"];
    const mockLiked = ["2", "4", "6"];
    setSavedPosts(mockSaved);
    setLikedPosts(mockLiked);
  }, []);

  // Toggle save post
  const handleSavePost = useCallback((postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

  // Toggle like post
  const handleLikePost = useCallback((postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar when clicking on a link
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Combine and sort posts
  const allPosts = useMemo(() => {
    return (projectsData?.data || [])
      .map((p: Project) => ({ ...p, type: "project" }))
      .concat(
        (eventsData?.data || []).map((e: Event) => ({ ...e, type: "event" }))
      )
      .sort(
        (a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [projectsData, eventsData]);

  // Filtered posts based on tab
  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    // Filter by tab
    if (activeTab === "projects") {
      posts = posts.filter((post: Project) => post.type === "project");
    } else if (activeTab === "events") {
      posts = posts.filter((post: Event) => post.type === "event");
    } else if (activeTab === "saved") {
      posts = posts.filter((post: Post) => savedPosts.includes(post.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post: Post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query)
      );
    }

    return posts;
  }, [allPosts, activeTab, savedPosts, searchQuery]);

  // Handle loading state
  const isLoading = !profileData || !projectsData || !eventsData;
  const hasError = profileError || projectsError || eventsError;

  // Trending topics (simulated)
  const trendingTopics = [
    "Hackathon",
    "AI Projects",
    "Web Development",
    "Mobile Apps",
    "Design",
  ];

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

      {/* Left Sidebar */}
      <LeftSidebar
        user={user}
        mobileSidebarOpen={mobileSidebarOpen}
        closeMobileSidebar={closeMobileSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Navbar */}
        <Navbar
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Feed */}
            <MainContent
              isLoading={isLoading}
              error={!!hasError}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredPosts={filteredPosts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              savedPosts={savedPosts}
              likedPosts={likedPosts}
              handleSavePost={handleSavePost}
              handleLikePost={handleLikePost}
            />

            {/* Right Sidebar */}
            <RightSidebar user={user} trendingTopics={trendingTopics} />
          </div>
        </div>
      </main>
    </div>
  );
}
