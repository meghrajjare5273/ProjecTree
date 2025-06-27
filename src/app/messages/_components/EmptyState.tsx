"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onStartNewChat: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onStartNewChat }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center text-muted-foreground">
        <svg
          className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="text-2xl font-semibold mb-2 text-foreground">
          Welcome to Messages
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          Select a conversation from the sidebar to start chatting, or start a
          new conversation
        </p>
        <Button
          onClick={onStartNewChat}
          className="px-8 py-3 bg-[#ffcc00] text-black rounded-xl hover:bg-[#e6b800] transition-colors shadow-sm"
        >
          Start New Chat
        </Button>
      </div>
    </div>
  );
};
