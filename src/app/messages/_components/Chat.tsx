/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@/hooks/use-socket";
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

  // Component state
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSelectingUser, setIsSelectingUser] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Refs
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Load conversations when connected
  useEffect(() => {
    if (isConnected && !isLoading) {
      console.log("Connected - loading conversations...");
      loadConversations();
    }
  }, [isConnected, isLoading, loadConversations]);

  // Improved typing indicators with debouncing
  useEffect(() => {
    if (!currentChatUser || !isConnected || !mountedRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (messageInput.length > 0) {
      // Start typing
      startTyping(currentChatUser);

      // Stop typing after 1 second of no input
      typingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          stopTyping(currentChatUser);
        }
      }, 1000);
    } else {
      // Stop typing immediately when input is cleared
      stopTyping(currentChatUser);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, currentChatUser, startTyping, stopTyping, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Debounced user search
  const searchUsers = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search requests
      searchTimeoutRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;

        try {
          const response = await fetch(
            `/api/users/search?q=${encodeURIComponent(query)}`
          );

          if (response.ok) {
            const users = await response.json();
            if (mountedRef.current) {
              setSearchResults(
                users.filter((user: any) => user.id !== currentUser.id)
              );
            }
          } else {
            console.error("Failed to search users:", response.statusText);
            if (mountedRef.current) {
              setSearchResults([]);
            }
          }
        } catch (error) {
          console.error("Error searching users:", error);
          if (mountedRef.current) {
            setSearchResults([]);
          }
        }
      }, 300);
    },
    [currentUser]
  );

  // Enhanced user selection with better state management
  const handleUserSelect = useCallback(
    async (userId: string) => {
      if (
        isSelectingUser ||
        userId === currentChatUser ||
        !mountedRef.current
      ) {
        return;
      }

      console.log("Selecting user:", userId);
      setIsSelectingUser(true);
      setLocalError(null);
      clearError();

      try {
        // Leave current chat first if exists
        if (currentChatUser) {
          await leaveChat();
          // Small delay to ensure cleanup
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!mountedRef.current) return;

        // Set new chat user
        setCurrentChatUser(userId);

        // Join new chat
        await joinChat(userId);

        if (!mountedRef.current) return;

        // Close search interface
        setShowUserSearch(false);
        setSearchQuery("");
        setSearchResults([]);

        // Focus message input
        setTimeout(() => {
          if (mountedRef.current) {
            messageInputRef.current?.focus();
          }
        }, 200);
      } catch (error) {
        console.error("Error selecting user:", error);
        if (mountedRef.current) {
          setCurrentChatUser(null);
          setLocalError("Failed to start chat");
        }
      } finally {
        if (mountedRef.current) {
          setIsSelectingUser(false);
        }
      }
    },
    [
      isSelectingUser,
      currentChatUser,
      leaveChat,
      setCurrentChatUser,
      joinChat,
      clearError,
    ]
  );

  // Enhanced message sending with better error handling
  const handleSendMessage = useCallback(async () => {
    if (
      !messageInput.trim() ||
      !currentChatUser ||
      !isConnected ||
      isSendingMessage ||
      !mountedRef.current
    ) {
      return;
    }

    const messageContent = messageInput.trim();
    setIsSendingMessage(true);
    setMessageInput(""); // Clear input immediately for better UX
    setLocalError(null);
    clearError();

    try {
      await sendMessage(currentChatUser, messageContent);

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      stopTyping(currentChatUser);
    } catch (error) {
      console.error("Failed to send message:", error);
      if (mountedRef.current) {
        // Restore message input on error
        setMessageInput(messageContent);
        setLocalError("Failed to send message");
      }
    } finally {
      if (mountedRef.current) {
        setIsSendingMessage(false);
      }
    }
  }, [
    messageInput,
    currentChatUser,
    isConnected,
    isSendingMessage,
    sendMessage,
    stopTyping,
    clearError,
  ]);

  // Keyboard event handler
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Format message time with error handling
  const formatMessageTime = useCallback((createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "Unknown time";
    }
  }, []);

  // Get current chat user info
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

  // Mark messages as read when chat is active
  useEffect(() => {
    if (
      currentChatUser &&
      messages.length > 0 &&
      isConnected &&
      !isLoading &&
      mountedRef.current
    ) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          markAsRead(currentChatUser);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentChatUser, messages.length, markAsRead, isConnected, isLoading]);

  // Handle leaving chat
  const handleLeaveChat = useCallback(async () => {
    if (currentChatUser && !isSelectingUser && mountedRef.current) {
      try {
        await leaveChat();
        setCurrentChatUser(null);
      } catch (error) {
        console.error("Error leaving chat:", error);
      }
    }
  }, [currentChatUser, leaveChat, setCurrentChatUser, isSelectingUser]);

  // Combined error display
  const displayError = error || localError;

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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              className={`w-2 h-2 rounded-full mr-2 transition-colors ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            {isSelectingUser && (
              <span className="text-xs text-blue-600 ml-2 animate-pulse">
                Loading...
              </span>
            )}
          </div>
        </div>

        {/* User Search */}
        {showUserSearch && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isSelectingUser}
              autoFocus
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() =>
                      !isSelectingUser && handleUserSelect(user.id)
                    }
                    className={`flex items-center p-3 cursor-pointer transition-colors ${
                      isSelectingUser
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={user.image || "/placeholder.svg?height=32&width=32"}
                      alt={user.name || user.username || "User"}
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/placeholder.svg?height=32&width=32";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.name || user.username || "Unknown User"}
                      </p>
                      {user.username && (
                        <p className="text-sm text-gray-600 truncate">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                No users found
              </p>
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
              className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-colors ${
                currentChatUser === conversation.other_user_id
                  ? "bg-blue-50 border-blue-200"
                  : isSelectingUser
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <img
                  src={
                    conversation.image || "/placeholder.svg?height=48&width=48"
                  }
                  alt={conversation.name || conversation.username || "User"}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=48&width=48";
                  }}
                />
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count > 99
                      ? "99+"
                      : conversation.unread_count}
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
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatMessageTime(conversation.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.content || "No messages yet"}
                </p>
              </div>
            </div>
          ))}

          {conversations.length === 0 && isConnected && !isLoading && (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChatUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={handleLeaveChat}
                    className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
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

                  {currentChatUserInfo && (
                    <>
                      <img
                        src={
                          currentChatUserInfo.image ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={
                          currentChatUserInfo.name ||
                          currentChatUserInfo.username ||
                          "User"
                        }
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=40&width=40";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">
                          {currentChatUserInfo.name ||
                            currentChatUserInfo.username ||
                            "Unknown User"}
                        </h3>
                        {typingUsers.has(currentChatUser) && (
                          <p className="text-sm text-green-600 animate-pulse">
                            Typing...
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleLeaveChat}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
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
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">
                    Loading messages...
                  </span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isMyMessage = message.senderId === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMyMessage
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-between mt-1 text-xs ${
                              isMyMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {isMyMessage && (
                              <span className="ml-2">
                                {message.read ? (
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
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {displayError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600">{displayError}</p>
                    <button
                      onClick={() => {
                        clearError();
                        setLocalError(null);
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors"
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
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isConnected
                        ? "Type a message..."
                        : "Waiting for connection..."
                    }
                    disabled={!isConnected || isSendingMessage}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {isSendingMessage && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={
                    !messageInput.trim() || !isConnected || isSendingMessage
                  }
                  className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          // No Chat Selected State
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-6"
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
              <h3 className="text-xl font-semibold mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-400 mb-6">
                Select a conversation from the sidebar to start chatting
              </p>
              <button
                onClick={() => setShowUserSearch(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
