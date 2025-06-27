"use client";

import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  other_user_id: string;
  content: string;
  createdAt: string;
  name: string | null;
  username: string | null;
  image: string | null;
  user_id: string;
  unread_count: number;
}

interface ConversationsListProps {
  conversations: Conversation[];
  currentChatUser: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isSelectingUser: boolean;
  onUserSelect: (userId: string) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  currentChatUser,
  isConnected,
  isLoading,
  isSelectingUser,
  onUserSelect,
}) => {
  const formatMessageTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "Unknown time";
    }
  };

  return (
    <ScrollArea className="flex-1 overflow-y-auto p-4">
      <div className="space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.other_user_id}
            onClick={() =>
              !isSelectingUser && onUserSelect(conversation.other_user_id)
            }
            className={`flex items-center p-4 cursor-pointer rounded-xl transition-all duration-200 ${
              currentChatUser === conversation.other_user_id
                ? "bg-[#ffcc00]/10 border-2 border-[#ffcc00]/20 shadow-sm"
                : isSelectingUser
                ? "opacity-50 cursor-not-allowed bg-card"
                : "hover:bg-accent/50 bg-card border border-border/50"
            }`}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={
                    conversation.image ||
                    "/placeholder.svg?height=48&width=48" ||
                    "/placeholder.svg"
                  }
                  alt={conversation.name || conversation.username || "User"}
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {conversation.name?.charAt(0).toUpperCase() ||
                    conversation.username?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>

              {conversation.unread_count > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-[#ffcc00] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unread_count > 99
                    ? "99+"
                    : conversation.unread_count}
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0 ml-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground truncate">
                  {conversation.name || conversation.username || "Unknown User"}
                </p>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {formatMessageTime(conversation.createdAt)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground truncate mt-1">
                {conversation.content || "No messages yet"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {conversations.length === 0 && isConnected && !isLoading && (
        <div className="p-8 text-center text-muted-foreground">
          <svg
            className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4"
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
          <p>No conversations yet</p>
        </div>
      )}
    </ScrollArea>
  );
};
