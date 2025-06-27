"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
}

interface UserSearchProps {
  searchQuery: string;
  searchResults: User[];
  isSelectingUser: boolean;
  onSearchChange: (query: string) => void;
  onUserSelect: (userId: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  searchQuery,
  searchResults,
  isSelectingUser,
  onSearchChange,
  onUserSelect,
}) => {
  return (
    <div className="p-4 border-b border-border bg-muted/50">
      <Input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
        disabled={isSelectingUser}
        autoFocus
      />

      {/* Search Results */}
      {searchResults.length > 0 && (
        <ScrollArea className="mt-3 max-h-40 overflow-y-auto bg-card border border-border rounded-lg shadow-sm">
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => !isSelectingUser && onUserSelect(user.id)}
              className={`flex items-center p-3 cursor-pointer transition-colors ${
                isSelectingUser
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-accent"
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.image || "/placeholder.svg?height=32&width=32"}
                  alt={user.name || user.username || "User"}
                />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() ||
                    user.username?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 ml-3">
                <p className="font-medium text-foreground truncate">
                  {user.name || user.username || "Unknown User"}
                </p>
                {user.username && (
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      )}

      {searchQuery && searchResults.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          No users found
        </p>
      )}
    </div>
  );
};
