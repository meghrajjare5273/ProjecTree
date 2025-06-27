"use client";

import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  sender: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  retryMessage?: (message: Message) => Promise<void>;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  isLoading,
  isLoadingMore,
  messagesContainerRef,
  messagesEndRef,
  retryMessage,
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
    <ScrollArea
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-4"
    >
      {isLoadingMore && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcc00]"></div>
          <span className="ml-2 text-muted-foreground">
            Loading more messages...
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcc00]"></div>
          <span className="ml-2 text-muted-foreground">
            Loading messages...
          </span>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center items-center h-full text-muted-foreground">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4"
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
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isMyMessage = message.senderId === currentUserId;
            return (
              <div
                key={message.id || message.tempId}
                className={`flex ${
                  isMyMessage ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative ${
                    isMyMessage
                      ? message.isFailed
                        ? "bg-red-100 text-red-800 border border-red-300 rounded-br-md"
                        : "bg-[#ffcc00] text-black rounded-br-md"
                      : "bg-card text-foreground border border-border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>

                  <div
                    className={`flex items-center justify-between mt-2 text-xs ${
                      isMyMessage
                        ? message.isFailed
                          ? "text-red-600"
                          : "text-black/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>{formatMessageTime(message.createdAt)}</span>
                    <div className="flex items-center ml-2">
                      {isMyMessage && (
                        <>
                          {message.isPending && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1" />
                          )}
                          {message.isFailed ? (
                            <Button
                              onClick={() =>
                                retryMessage && retryMessage(message)
                              }
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-red-600 hover:text-red-800"
                              title="Retry sending message"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          ) : message.read ? (
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            !message.isPending && (
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {message.isFailed && (
                    <div className="absolute -bottom-1 -right-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </ScrollArea>
  );
};
