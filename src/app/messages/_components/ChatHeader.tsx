"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatUser {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
}

interface ChatHeaderProps {
  currentChatUserInfo: ChatUser | null;
  currentChatUser: string | null;
  typingUsers: Set<string>;
  isSelectingUser: boolean;
  onLeaveChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentChatUserInfo,
  currentChatUser,
  typingUsers,
  isSelectingUser,
  onLeaveChat,
}) => {
  if (!currentChatUserInfo) return null;

  return (
    <div className="p-6 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            onClick={onLeaveChat}
            variant="ghost"
            size="icon"
            className="mr-3 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors lg:hidden"
            disabled={isSelectingUser}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                currentChatUserInfo.image ||
                "/placeholder.svg?height=40&width=40" ||
                "/placeholder.svg"
              }
              alt={
                currentChatUserInfo.name ||
                currentChatUserInfo.username ||
                "User"
              }
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {currentChatUserInfo.name?.charAt(0).toUpperCase() ||
                currentChatUserInfo.username?.charAt(0).toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>

          <div className="ml-4">
            <h3 className="font-semibold text-foreground text-lg">
              {currentChatUserInfo.name ||
                currentChatUserInfo.username ||
                "Unknown User"}
            </h3>
            {typingUsers.has(currentChatUser!) && (
              <p className="text-sm text-[#ffcc00] animate-pulse flex items-center">
                <span className="mr-2">Typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-[#ffcc00] rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-[#ffcc00] rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-[#ffcc00] rounded-full animate-bounce delay-200" />
                </div>
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={onLeaveChat}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors hidden lg:block"
          disabled={isSelectingUser}
          title="Close chat"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
