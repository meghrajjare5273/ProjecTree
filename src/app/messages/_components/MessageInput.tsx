"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  messageInput: string;
  isConnected: boolean;
  isSendingMessage: boolean;
  displayError: string | null;
  messageInputRef: React.RefObject<HTMLInputElement>;
  onMessageChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onClearError: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  isConnected,
  isSendingMessage,
  displayError,
  messageInputRef,
  onMessageChange,
  onKeyPress,
  onSendMessage,
  onClearError,
}) => {
  return (
    <div className="p-6 border-t border-border bg-card">
      {displayError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{displayError}</p>
            <Button
              onClick={onClearError}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <svg
                className="w-4 h-4"
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
      )}

      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Input
            ref={messageInputRef}
            type="text"
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={
              isConnected ? "Type a message..." : "Waiting for connection..."
            }
            disabled={!isConnected || isSendingMessage}
            className="w-full p-4 pr-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-[#ffcc00]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {isSendingMessage && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ffcc00]"></div>
            </div>
          )}
        </div>

        <Button
          onClick={onSendMessage}
          disabled={!messageInput.trim() || !isConnected || isSendingMessage}
          className="p-4 bg-[#ffcc00] text-black rounded-xl hover:bg-[#e6b800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
