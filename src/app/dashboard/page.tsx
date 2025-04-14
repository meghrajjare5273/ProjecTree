"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import type User from "@/types/users";
import type Post from "@/types/posts";
import type { Event, Project } from "@/types/posts";

// Import components using dynamic imports for better performance
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

const LeftSidebar = dynamic(() => import("./_components/LeftSidebar"), {
  ssr: false,
  loading: () => <SidebarSkeleton />,
});

const RightSidebar = dynamic(() => import("./_components/RightSidebar"), {
  ssr: false,
  loading: () => <RightSidebarSkeleton />,
});

const MainContent = dynamic(() => import("./_components/MainContent"), {
  ssr: false,
  loading: () => <MainContentSkeleton />,
});

const Navbar = dynamic(() => import("./_components/Navbar"), {
  ssr: false,
  loading: () => <NavbarSkeleton />,
});

// Skeleton components for better loading experience
const SidebarSkeleton = () => (
  <div className="fixed top-0 left-0 z-40 w-[280px] h-screen bg-[#1a1a1a] border-r border-[#333333]">
    <div className="p-6 flex items-center justify-center">
      <div className="h-8 w-40 bg-gray-700 rounded animate-pulse"></div>
    </div>
    <div className="px-6 py-4 flex flex-col items-center border-b border-[#333333]">
      <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse mb-3"></div>
      <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-1"></div>
      <div className="h-4 w-20 bg-gray-700 rounded animate-pulse mb-3"></div>
    </div>
  </div>
);

const NavbarSkeleton = () => (
  <header className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333] py-4 px-6 sticky top-0 z-30">
    <div className="max-w-5xl mx-auto flex justify-between items-center">
      <div className="flex-1">
        <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  </header>
);

const MainContentSkeleton = () => (
  <div className="flex-1 order-2 md:order-1">
    <div className="bg-[#1a1a1a] rounded-lg mb-6 overflow-hidden">
      <div className="flex overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3 flex-1 flex justify-center">
            <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#1a1a1a] border-[#333333] rounded-lg overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="ml-3">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse mb-4"></div>
          </div>
          <div className="h-40 bg-gray-700 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const RightSidebarSkeleton = () => (
  <div className="w-full md:w-80 order-1 md:order-2">
    <div className="bg-[#1a1a1a] border-[#333333] rounded-lg mb-6">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse"></div>
          <div className="flex-1 h-10 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// Fetcher function for SWR with cache control
const fetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  }).then((res) => res.json());

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Only run client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data using SWR with optimized settings
  const { data: profileData, error: profileError } = useSWR(
    "/api/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const { data: projectsData, error: projectsError } = useSWR(
    "/api/projects",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const { data: eventsData, error: eventsError } = useSWR(
    "/api/events",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Check session and redirect if not authenticated
  useEffect(() => {
    if (!mounted) return;

    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.push("/auth?mode=signin");
      }
    };
    checkSession();
  }, [router, mounted]);

  // Set user data when profile data is available
  useEffect(() => {
    if (profileData) {
      setUser(profileData.user);
    }
  }, [profileData]);

  // Simulate saved and liked posts (would come from API in real app)
  useEffect(() => {
    if (!mounted) return;

    // Simulated saved and liked posts
    const mockSaved = ["1", "3", "5"];
    const mockLiked = ["2", "4", "6"];
    setSavedPosts(mockSaved);
    setLikedPosts(mockLiked);
  }, [mounted]);

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

  // Combine and sort posts with memoization
  const allPosts = useMemo(() => {
    if (!projectsData?.data || !eventsData?.data) return [];

    return (projectsData.data || [])
      .map((p: Project) => ({ ...p, type: "project" }))
      .concat(
        (eventsData.data || []).map((e: Event) => ({ ...e, type: "event" }))
      )
      .sort(
        (a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [projectsData, eventsData]);

  // Filtered posts based on tab with memoization
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

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#121212]">
        <SidebarSkeleton />
        <main className="flex-1 min-h-screen ml-0 md:ml-[280px]">
          <NavbarSkeleton />
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row gap-6">
              <MainContentSkeleton />
              <RightSidebarSkeleton />
            </div>
          </div>
        </main>
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
