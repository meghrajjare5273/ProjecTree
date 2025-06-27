"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
  isConnected: boolean;
  isSelectingUser: boolean;
  unreadCount: number;
  onRetryConnection: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isSelectingUser,
  unreadCount,
  onRetryConnection,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 transition-colors ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        {isSelectingUser && (
          <span className="text-xs text-[#ffcc00] ml-2 animate-pulse">
            Loading...
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {unreadCount > 0 && (
          <Badge className="bg-[#ffcc00] text-black text-xs font-bold rounded-full px-2 py-1">
            {unreadCount}
          </Badge>
        )}
        {!isConnected && (
          <Button
            onClick={onRetryConnection}
            variant="link"
            className="text-[#ffcc00] hover:text-[#e6b800] transition-colors"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};
