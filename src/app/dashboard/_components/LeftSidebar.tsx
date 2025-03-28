"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import type User from "@/types/users";

// Icons
import {
  Home,
  Search,
  Bell,
  Bookmark,
  Layers,
  Calendar,
  Users,
  UserIcon,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";

interface LeftSidebarProps {
  user: User | null;
  mobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
}

export default function LeftSidebar({
  user,
  mobileSidebarOpen,
  closeMobileSidebar,
}: LeftSidebarProps) {
  const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then((res) => res.json());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: userStats, error: userStatsError } = useSWR(
    "/api/user-stats",
    fetcher
  );
  const router = useRouter();

  // Handle sign out
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <aside
      className={`${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed md:sticky md:translate-x-0 top-0 left-0 z-40 w-[280px] h-screen bg-[#1a1a1a] border-r border-[#333333] transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          Projec<span className="text-[#ffcc00]">Tree</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 flex flex-col items-center border-b border-[#333333]">
        {user ? (
          <>
            <Link href={`/users/${user.username}`} onClick={closeMobileSidebar}>
              <div className="relative w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.3)]">
                <Image
                  src={user.image || "/placeholder.svg?height=96&width=96"}
                  alt={user.name || "User"}
                  className="rounded-full object-cover"
                  fill
                />
              </div>
            </Link>
            <h3 className="text-white font-medium text-lg">{user.name}</h3>
            <p className="text-gray-400 text-sm">@{user.username}</p>

            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <p className="text-[#ffcc00] font-bold">{userStats.posts}</p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-[#ffcc00] font-bold">
                  {userStats.following}
                </p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
              <div className="text-center">
                <p className="text-[#ffcc00] font-bold">
                  {userStats.followers}
                </p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse mb-3"></div>
            <div className="h-5 w-24 bg-gray-700 animate-pulse mb-1"></div>
            <div className="h-4 w-20 bg-gray-700 animate-pulse mb-3"></div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-5 w-8 bg-gray-700 animate-pulse mb-1"></div>
                  <div className="h-3 w-12 bg-gray-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </>
        )}
          </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2.5 text-white bg-[#252525] rounded-lg"
            onClick={closeMobileSidebar}
          >
            <Home className="w-5 h-5 mr-3" />
            <span>Home</span>
          </Link>
          <Link
            href="/explore"
            className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
            onClick={closeMobileSidebar}
          >
            <Search className="w-5 h-5 mr-3" />
            <span>Explore</span>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors justify-between"
            onClick={closeMobileSidebar}
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-3" />
              <span>Notifications</span>
            </div>
            <div className="bg-[#ffcc00] text-black text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </div>
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
            onClick={closeMobileSidebar}
          >
            <Bookmark className="w-5 h-5 mr-3" />
            <span>Bookmarks</span>
          </Link>
        </div>

        <Separator className="my-6 bg-[#333333]" />

        <div className="space-y-1">
          <h4 className="text-gray-400 text-xs uppercase font-medium px-4 mb-2">
            Content
          </h4>
          <Link
            href="/projects"
            className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
            onClick={closeMobileSidebar}
          >
            <Layers className="w-5 h-5 mr-3" />
            <span>Projects</span>
          </Link>
          <Link
            href="/events"
            className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
            onClick={closeMobileSidebar}
          >
            <Calendar className="w-5 h-5 mr-3" />
            <span>Events</span>
          </Link>
          <Link
            href="/people"
            className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
            onClick={closeMobileSidebar}
          >
            <Users className="w-5 h-5 mr-3" />
            <span>People</span>
          </Link>
        </div>
      </nav>

      {/* Create Post Button */}
      <div className="px-6 py-4">
        <Link href="/create-post" onClick={closeMobileSidebar}>
          <Button className="w-full bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* User Menu */}
      <div className="mt-auto p-4 border-t border-[#333333]">
        <div className="flex items-center justify-between p-2 hover:bg-[#252525] rounded-lg transition-colors">
          <div className="flex items-center">
            <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
            <Link
              href={`/users/${user?.username}`}
              className="text-gray-300"
              onClick={closeMobileSidebar}
            >
              Profile
            </Link>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-center justify-between p-2 hover:bg-[#252525] rounded-lg transition-colors">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-3 text-gray-400" />
            <Link
              href="/settings"
              className="text-gray-300"
              onClick={closeMobileSidebar}
            >
              Settings
            </Link>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between p-2 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors text-left mt-2"
        >
          <div className="flex items-center">
            <LogOut className="w-5 h-5 mr-3 text-gray-400" />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
