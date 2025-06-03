// src/app/messages/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useMessages } from "@/hooks/use-socket";
import { authClient } from "@/lib/auth-client";

interface MessagingProps {
  receiverId: string;
  receiverName?: string;
}

function Messaging({
  receiverId,
  receiverName,
}: MessagingProps) {
  const { data: session } = authClient.useSession();
  const { messages, sendMessage, sendTyping, typingUsers, isConnected } =
    useMessages(receiverId);

  const [content, setContent] = useState("");
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (content.trim() && !isCurrentlyTyping) {
      setIsCurrentlyTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isCurrentlyTyping) {
        setIsCurrentlyTyping(false);
        sendTyping(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, isCurrentlyTyping, sendTyping]);

  const handleSendMessage = () => {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    sendMessage(content, tempId);
    setContent("");

    // Stop typing indicator
    if (isCurrentlyTyping) {
      setIsCurrentlyTyping(false);
      sendTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!session?.user) {
    return <div>Please log in to send messages.</div>;
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {receiverName || `User ${receiverId}`}
          </h2>
          <div
            className={`text-sm ${
              isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === session.user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 border"
                  } ${msg.sending ? "opacity-50" : ""}`}
                >
                  <div className="break-words">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {(() => {
                      try {
                        return new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } catch {
                        return "Invalid time";
                      }
                    })()}
                    {msg.sending && " • Sending..."}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-2 rounded-lg text-gray-600 text-sm">
              {receiverName || "User"} is typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!content.trim() || !isConnected}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Example usage component for testing
export default function MessagingPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Enter user ID to message"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      {selectedUserId && (
        <div className="flex-1">
          <Messaging receiverId={selectedUserId} />
        </div>
      )}
    </div>
  );
}
