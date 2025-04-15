"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PostFormHeaderProps {
  postType: "project" | "event";
}

export default function PostFormHeader({ postType }: PostFormHeaderProps) {
  return (
    <header className="bg-[#1a1a1a] border-b border-[#333333] py-4 px-6 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-white text-xl font-bold">
            Create New {postType === "project" ? "Project" : "Event"}
          </h1>
        </div>
        <Link href="/" className="text-2xl font-bold text-white">
          Projec<span className="text-[#ffcc00]">Tree</span>
        </Link>
      </div>
    </header>
  );
}
