/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@/hooks/use-socket"; // Adjust import path
import { formatDistanceToNow } from "date-fns";

interface ChatComponentProps {
  currentUser: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  className?: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  currentUser,
  className = "",
}) => {
  const {
    isConnected,
    isLoading,
    error,
    messages,
    conversations,
    unreadCount,
    currentChatUser,
    setCurrentChatUser,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    loadConversations,
    clearError,
    getConversationByUserId,
    messagesEndRef,
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSelectingUser, setIsSelectingUser] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("Chat Component State:", {
      isConnected,
      messagesCount: messages.length,
      conversationsCount: conversations.length,
      currentChatUser,
      unreadCount,
      isSelectingUser,
    });
  }, [
    isConnected,
    messages,
    conversations,
    currentChatUser,
    unreadCount,
    isSelectingUser,
  ]);

  // Load conversations when connected
  useEffect(() => {
    if (isConnected && !isLoading) {
      console.log("Connected - loading conversations...");
      loadConversations();
    }
  }, [isConnected, isLoading, loadConversations]);

  // Handle typing indicators with improved debouncing
  useEffect(() => {
    if (currentChatUser && messageInput.length > 0 && isConnected) {
      startTyping(currentChatUser);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of no input
      typingTimeoutRef.current = setTimeout(() => {
        if (currentChatUser) {
          stopTyping(currentChatUser);
        }
      }, 1000);
    } else if (currentChatUser && messageInput.length === 0) {
      // Stop typing immediately when input is cleared
      stopTyping(currentChatUser);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, currentChatUser, startTyping, stopTyping, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Search users function
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const users = await response.json();
          setSearchResults(
            users.filter((user: any) => user.id !== currentUser.id)
          );
        } else {
          console.error("Failed to search users:", response.statusText);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      }
    },
    [currentUser]
  );

  const handleUserSelect = useCallback(
    async (userId: string) => {
      if (isSelectingUser || userId === currentChatUser) {
        return; // Prevent multiple simultaneous selections or selecting the same user
      }

      console.log("Selecting user:", userId);
      setIsSelectingUser(true);

      try {
        // Clear any existing chat first
        if (currentChatUser) {
          await leaveChat();
        }

        // Set the new chat user
        setCurrentChatUser(userId);

        // Join the new chat
        await joinChat(userId);

        // Close search and clear search state
        setShowUserSearch(false);
        setSearchQuery("");
        setSearchResults([]);

        // Focus on message input after selecting user
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 200);
      } catch (error) {
        console.error("Error selecting user:", error);
        // Reset state on error
        setCurrentChatUser(null);
      } finally {
        setIsSelectingUser(false);
      }
    },
    [isSelectingUser, currentChatUser, leaveChat, setCurrentChatUser, joinChat]
  );

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !currentChatUser || !isConnected) {
      console.warn(
        "Cannot send message: empty input, no chat user, or not connected"
      );
      return;
    }

    console.log("Sending message:", messageInput, "to:", currentChatUser);
    sendMessage(currentChatUser, messageInput);
    setMessageInput("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(currentChatUser);
  }, [messageInput, currentChatUser, isConnected, sendMessage, stopTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "Unknown time";
    }
  };

  const getCurrentChatUserInfo = useCallback(() => {
    if (!currentChatUser) return null;
    const conversation = getConversationByUserId(currentChatUser);
    return conversation
      ? {
          id: conversation.other_user_id,
          name: conversation.name,
          username: conversation.username,
          image: conversation.image,
        }
      : null;
  }, [currentChatUser, getConversationByUserId]);

  const currentChatUserInfo = getCurrentChatUserInfo();

  // Handle marking messages as read when entering chat
  useEffect(() => {
    if (currentChatUser && messages.length > 0 && isConnected) {
      // Mark messages as read after a short delay
      const timer = setTimeout(() => {
        markAsRead(currentChatUser);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentChatUser, messages.length, markAsRead, isConnected]);

  // Handle leaving chat
  const handleLeaveChat = useCallback(async () => {
    if (currentChatUser) {
      await leaveChat();
      setCurrentChatUser(null);
    }
  }, [currentChatUser, leaveChat, setCurrentChatUser]);

  return (
    <div className={`flex h-full bg-white ${className}`}>
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
              <button
                onClick={() => setShowUserSearch(!showUserSearch)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Start new chat"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center mt-2">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            {isSelectingUser && (
              <span className="text-xs text-blue-600 ml-2">Selecting...</span>
            )}
            {/* Debug info in development */}
            {process.env.NODE_ENV === "development" && (
              <span className="text-xs text-gray-400 ml-2">
                M:{messages.length} C:{conversations.length}
              </span>
            )}
          </div>
        </div>

        {/* User Search */}
        {showUserSearch && (
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSelectingUser}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() =>
                      !isSelectingUser && handleUserSelect(user.id)
                    }
                    className={`flex items-center p-2 rounded cursor-pointer ${
                      isSelectingUser
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <img
                      src={user.image || "/default-avatar.png"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.other_user_id}
              onClick={() =>
                !isSelectingUser && handleUserSelect(conversation.other_user_id)
              }
              className={`flex items-center p-4 cursor-pointer border-b border-gray-100 ${
                currentChatUser === conversation.other_user_id
                  ? "bg-blue-50 border-blue-200"
                  : isSelectingUser
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <img
                  src={conversation.image || "/default-avatar.png"}
                  alt={conversation.name || conversation.username || "User"}
                  className="w-12 h-12 rounded-full mr-3"
                />
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">
                    {conversation.name ||
                      conversation.username ||
                      "Unknown User"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(conversation.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.content}
                </p>
              </div>
            </div>
          ))}

          {conversations.length === 0 && isConnected && !isLoading && (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">
                Click the + button to start a new chat
              </p>
            </div>
          )}

          {(!isConnected || isLoading) && (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>{isLoading ? "Loading..." : "Connecting..."}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChatUser && currentChatUserInfo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={handleLeaveChat}
                    className="p-2 hover:bg-gray-100 rounded-full mr-3 md:hidden"
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
                  </button>

                  <img
                    src={currentChatUserInfo.image || "/default-avatar.png"}
                    alt={
                      currentChatUserInfo.name ||
                      currentChatUserInfo.username ||
                      "User"
                    }
                    className="w-10 h-10 rounded-full mr-3"
                  />

                  <div>
                    <h3 className="font-semibold">
                      {currentChatUserInfo.name ||
                        currentChatUserInfo.username ||
                        "Unknown User"}
                    </h3>
                    {typingUsers.has(currentChatUser) && (
                      <p className="text-sm text-blue-600">Typing...</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => markAsRead(currentChatUser)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Mark as read"
                  disabled={!isConnected}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUser.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {message.senderId === currentUser.id && (
                            <span className="text-xs opacity-75 ml-2">
                              {message.read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {messages.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {error && (
                <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                  <button
                    onClick={clearError}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected || isSelectingUser}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={
                    !messageInput.trim() || !isConnected || isSelectingUser
                  }
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isSelectingUser ? "Loading chat..." : "Select a conversation"}
              </h3>
              <p className="text-gray-600">
                {isSelectingUser
                  ? "Please wait while we load your chat"
                  : "Choose from your existing conversations or start a new one"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
