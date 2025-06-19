/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@/hooks/use-socket";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// import Link from "next/link";

interface ChatComponentProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined | undefined;
    username?: string | null | undefined;
    displayUsername?: string | undefined;
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
    isLoadingMore,
    loadMoreMessages,
    messagesContainerRef,
  } = useChat({
    currentUserId: currentUser.id, // Pass the current user ID
    autoConnect: true,
  });

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
    if (isConnected && !isLoading && !currentChatUser) {
      console.log("Connected - loading conversations...");
      const timer = setTimeout(() => {
        loadConversations();
      }, 1000); // Add delay to ensure connection is stable

      return () => clearTimeout(timer);
    }
  }, [isConnected, isLoading, loadConversations, currentChatUser]);

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

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          stopTyping(currentChatUser);
        }
      }, 2000);
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
    async (query: string) => {
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
            `/api/users/search?q=${encodeURIComponent(query)}`,
            {
              credentials: "include", // Include cookies for authentication
            }
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
      }, 500);
    },
    [currentUser]
  );

  // Enhanced user selection with better error handling
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
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        if (!mountedRef.current) return;

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
        }, 300);
      } catch (error) {
        console.error("Error selecting user:", error);
        if (mountedRef.current) {
          setCurrentChatUser(null);
          setLocalError("Failed to start chat. Please try again.");
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
      joinChat,
      clearError,
      setCurrentChatUser,
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
        setLocalError("Failed to send message. Please try again.");
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

  // Add scroll event listener to load more messages
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current && !isLoadingMore) {
        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop === 0 && messages.length > 0) {
          loadMoreMessages();
        }
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [messages, loadMoreMessages, isLoadingMore, messagesContainerRef]);

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
      }, 1500);

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

  // Connection retry handler
  const handleRetryConnection = useCallback(() => {
    setLocalError(null);
    clearError();
    window.location.reload(); // Simple retry by reloading
  }, [clearError]);

  // Replace the main return statement with this modernized version:

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Messages</h2>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Badge className="bg-[#ffcc00] text-black text-xs font-bold rounded-full px-2 py-1">
                  {unreadCount}
                </Badge>
              )}
              <Button
                onClick={() => setShowUserSearch(!showUserSearch)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
                title="Start new chat"
                disabled={isSelectingUser}
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Connection Status */}
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

            {!isConnected && (
              <Button
                onClick={handleRetryConnection}
                variant="link"
                className="text-[#ffcc00] hover:text-[#e6b800] transition-colors"
              >
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* User Search */}
        {showUserSearch && (
          <div className="p-4 border-b border-border bg-muted/50">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
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
                    onClick={() =>
                      !isSelectingUser && handleUserSelect(user.id)
                    }
                    className={`flex items-center p-3 cursor-pointer transition-colors ${
                      isSelectingUser
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          user.image || "/placeholder.svg?height=32&width=32"
                        }
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
        )}

        {/* Conversations List */}
        <ScrollArea className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.other_user_id}
                onClick={() =>
                  !isSelectingUser &&
                  handleUserSelect(conversation.other_user_id)
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
                        "/placeholder.svg?height=48&width=48"
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
                      {conversation.name ||
                        conversation.username ||
                        "Unknown User"}
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {currentChatUserInfo ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    onClick={handleLeaveChat}
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

                  {currentChatUserInfo && (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            currentChatUserInfo.image ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={
                            currentChatUserInfo.name ||
                            currentChatUserInfo.username ||
                            "User"
                          }
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {currentChatUserInfo.name?.charAt(0).toUpperCase() ||
                            currentChatUserInfo.username
                              ?.charAt(0)
                              .toUpperCase() ||
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
                    </>
                  )}
                </div>

                <Button
                  onClick={handleLeaveChat}
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

            {/* Messages Area */}
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
                    const isMyMessage = message.senderId === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            isMyMessage
                              ? "bg-[#ffcc00] text-black rounded-br-md"
                              : "bg-card text-foreground border border-border rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-between mt-2 text-xs ${
                              isMyMessage
                                ? "text-black/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {isMyMessage && (
                              <span className="ml-2 flex items-center">
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
            </ScrollArea>

            {/* Message Input */}
            <div className="p-6 border-t border-border bg-card">
              {displayError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-destructive">{displayError}</p>
                    <Button
                      onClick={() => {
                        clearError();
                        setLocalError(null);
                      }}
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
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isConnected
                        ? "Type a message..."
                        : "Waiting for connection..."
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
                  onClick={handleSendMessage}
                  disabled={
                    !messageInput.trim() || !isConnected || isSendingMessage
                  }
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
          </>
        ) : (
          // No Chat Selected State
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <svg
                className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6"
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
              <h3 className="text-2xl font-semibold mb-2 text-foreground">
                Welcome to Messages
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Select a conversation from the sidebar to start chatting, or
                start a new conversation
              </p>
              <Button
                onClick={() => setShowUserSearch(true)}
                className="px-8 py-3 bg-[#ffcc00] text-black rounded-xl hover:bg-[#e6b800] transition-colors shadow-sm"
              >
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
