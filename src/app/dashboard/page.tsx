/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type User from "@/types/users";
import type Post from "@/types/posts";
import type { Event, Project } from "@/types/posts";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

const LeftSidebar = dynamic(() => import("./_components/LeftSidebar"), {
  ssr: false,
});
const RightSidebar = dynamic(() => import("./_components/RightSidebar"), {
  ssr: false,
});
const MainContent = dynamic(() => import("./_components/MainContent"), {
  ssr: false,
});
const Navbar = dynamic(() => import("./_components/Navbar"), { ssr: false });

const PAGE_SIZE = 10;

interface PaginationData {
  hasMore: boolean;
  lastId: string | null;
  totalCount?: number;
}

interface APIResponse {
  data: any[];
  pagination: PaginationData;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "projects" | "events" | "saved"
  >("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [projectsPagination, setProjectsPagination] = useState<PaginationData>({
    hasMore: true,
    lastId: null,
  });
  const [eventsPagination, setEventsPagination] = useState<PaginationData>({
    hasMore: true,
    lastId: null,
  });

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.push("/auth?mode=signin");
        return;
      }

      // Fetch user profile
      try {
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser(profileData.user);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    checkSession();
  }, [router]);

  const loadProjects = useCallback(async (reset = false) => {
    const lastId = reset ? null : projectsPagination.lastId;

    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        ...(lastId && { lastId }),
      });

      const response = await fetch(`/api/projects?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const data: APIResponse = await response.json();

      const transformedProjects = data.data.map((p: Project) => ({
        ...p,
        type: "project",
      }));

      if (reset) {
        setAllPosts((prev: any) => [
          ...transformedProjects,
          ...prev.filter((post: any) => post.type === "event"),
        ]);
      } else {
        setAllPosts((prev: any) => [
          ...prev.filter((post: any) => post.type === "event"),
          ...prev.filter((post: any) => post.type === "project"),
          ...transformedProjects,
        ]);
      }

      setProjectsPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load projects:", error);
      throw error;
    }
  },[projectsPagination.lastId]);

  const loadEvents = useCallback(async (reset = false) => {
    const lastId = reset ? null : eventsPagination.lastId;

    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        ...(lastId && { lastId }),
      });

      const response = await fetch(`/api/events?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const data: APIResponse = await response.json();

      const transformedEvents = data.data.map((e: Event) => ({
        ...e,
        type: "event",
      }));

      if (reset) {
        setAllPosts((prev: any) => [
          ...prev.filter((post: any) => post.type === "project"),
          ...transformedEvents,
        ]);
      } else {
        setAllPosts((prev: any) => [
          ...prev.filter((post: any) => post.type === "project"),
          ...prev.filter((post: any) => post.type === "event"),
          ...transformedEvents,
        ]);
      }

      setEventsPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load events:", error);
      throw error;
    }
  },[eventsPagination.lastId]);
  
  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
  
      try {
        await Promise.all([loadProjects(true), loadEvents(true)]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      loadInitialData();
    }
  }, [loadEvents, loadProjects, user]);



  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const promises = [];

      if (activeTab === "all" || activeTab === "projects") {
        if (projectsPagination.hasMore) {
          promises.push(loadProjects(false));
        }
      }

      if (activeTab === "all" || activeTab === "events") {
        if (eventsPagination.hasMore) {
          promises.push(loadEvents(false));
        }
      }

      await Promise.all(promises);

      // Update hasMore based on both pagination states
      const stillHasMore =
        (activeTab === "all" &&
          (projectsPagination.hasMore || eventsPagination.hasMore)) ||
        (activeTab === "projects" && projectsPagination.hasMore) ||
        (activeTab === "events" && eventsPagination.hasMore);

      setHasMore(stillHasMore);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, activeTab, projectsPagination.hasMore, eventsPagination.hasMore, loadProjects, loadEvents]);

  // Filter posts based on active tab and search
  const filteredPosts = allPosts
    .filter((post) => {
      if (activeTab === "projects") return post.type === "project";
      if (activeTab === "events") return post.type === "event";
      if (activeTab === "saved") return savedPosts.includes(post.id);
      return true; // "all" tab
    })
    .filter((post) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Mock saved and liked posts
  useEffect(() => {
    setSavedPosts(["1", "3", "5"]);
    setLikedPosts(["2", "4", "6"]);
  }, []);

  const handleSavePost = useCallback((postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const handleLikePost = useCallback((postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

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
      />

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
              error={!!error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredPosts={filteredPosts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              savedPosts={savedPosts}
              likedPosts={likedPosts}
              handleSavePost={handleSavePost}
              handleLikePost={handleLikePost}
              hasMore={hasMore}
              loadMore={loadMore}
              isLoadingMore={isLoadingMore}
            />

            {/* Right Sidebar */}
            <RightSidebar user={user} trendingTopics={trendingTopics} />
          </div>
        </div>
      </main>
    </div>
  );
}
