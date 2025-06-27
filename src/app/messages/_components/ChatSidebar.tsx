"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import { UserSearch } from "./UserSearch";
import { ConversationsList } from "./ConversationsList";

interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
}

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

interface ChatSidebarProps {
  isConnected: boolean;
  isSelectingUser: boolean;
  unreadCount: number;
  showUserSearch: boolean;
  searchQuery: string;
  searchResults: User[];
  conversations: Conversation[];
  currentChatUser: string | null;
  isLoading: boolean;
  onRetryConnection: () => void;
  onToggleUserSearch: () => void;
  onSearchChange: (query: string) => void;
  onUserSelect: (userId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isConnected,
  isSelectingUser,
  unreadCount,
  showUserSearch,
  searchQuery,
  searchResults,
  conversations,
  currentChatUser,
  isLoading,
  onRetryConnection,
  onToggleUserSearch,
  onSearchChange,
  onUserSelect,
}) => {
  return (
    <div className="w-1/3 border-r border-border flex flex-col bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">Messages</h2>
          <Button
            onClick={onToggleUserSearch}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
            title="Start new chat"
            disabled={isSelectingUser}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <ConnectionStatus
          isConnected={isConnected}
          isSelectingUser={isSelectingUser}
          unreadCount={unreadCount}
          onRetryConnection={onRetryConnection}
        />
      </div>

      {/* User Search */}
      {showUserSearch && (
        <UserSearch
          searchQuery={searchQuery}
          searchResults={searchResults}
          isSelectingUser={isSelectingUser}
          onSearchChange={onSearchChange}
          onUserSelect={onUserSelect}
        />
      )}

      {/* Conversations List */}
      <ConversationsList
        conversations={conversations}
        currentChatUser={currentChatUser}
        isConnected={isConnected}
        isLoading={isLoading}
        isSelectingUser={isSelectingUser}
        onUserSelect={onUserSelect}
      />
    </div>
  );
};
