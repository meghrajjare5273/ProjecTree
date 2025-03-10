/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  Calendar,
  Bookmark,
  Settings,
  PlusCircle,
  Trophy,
  MessageSquare,
  Bell,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";

interface User {
  id: string;
  username?: string | null;
  name?: string | null;
  email: string;
  image?: string | null;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth?mode=signin");
        },
      },
    });
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Explore",
      path: "/explore",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Events",
      path: "/events",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: <Bookmark className="h-5 w-5" />,
    },
    {
      name: "Achievements",
      path: "/achievements",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } h-screen fixed left-0 top-0 z-30 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 transition-all duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center">
            {!isCollapsed ? (
              <span className="text-xl font-bold text-white">
                Projec<span className="text-yellow-400">Tree</span>
              </span>
            ) : (
              <span className="text-xl font-bold text-yellow-400">PT</span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "justify-start"
                    } p-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.name}</span>
                      )}
                    </div>
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="w-1.5 h-6 rounded-full bg-yellow-400 ml-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Create Button */}
        <div className="px-3 mb-4">
          <Link
            href="/create"
            className={`flex items-center ${
              isCollapsed ? "justify-center" : ""
            } bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg p-2.5 transition-colors duration-200`}
          >
            <PlusCircle className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">Create Post</span>}
          </Link>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-800 p-4">
          {user ? (
            <div className="flex items-center justify-between">
              <Link
                href={`/users/${user.username}`}
                className="flex items-center"
              >
                <Avatar className="h-10 w-10 rounded-full border-2 border-yellow-400/50">
                  <img
                    src={user.image || "/placeholder.svg?height=40&width=40"}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover rounded-full"
                  />
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                      {user.name || user.username || "User"}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">
                      @{user.username}
                    </p>
                  </div>
                )}
              </Link>
              {!isCollapsed && (
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-700"></div>
              {!isCollapsed && (
                <div className="ml-3">
                  <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-gray-700 rounded"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
