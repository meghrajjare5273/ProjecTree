// /* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, MessageSquare, ArrowLeft } from "lucide-react";
import type User from "@/types/users";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/ui/search-dialog";

interface ProfileNavbarProps {
  user: User | null;
  profileUser: {
    name: string | null;
    username: string;
  };
}

export default function ProfileNavbar({
  user,
  profileUser,
}: ProfileNavbarProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clientUser, setClientUser] = useState<User | null>(null);

  useEffect(() => {
    setClientUser(user);
  }, [user]);

  return (
    <header className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333] py-4 px-6 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="ml-8 md:ml-0 flex-1 flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-300 hover:text-white hover:bg-[#252525]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold">
              {profileUser.name || `@${profileUser.username}`}
            </h1>
            <p className="text-gray-400 text-sm">@{profileUser.username}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <SearchDialog />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Link href="/messages">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-300 hover:text-white hover:bg-[#252525]"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-300 hover:text-white hover:bg-[#252525] relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#ffcc00] rounded-full"></span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
