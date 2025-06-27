/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@/hooks/use-socket";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";

interface ChatComponentProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
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
    retryMessage,
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
    currentUserId: currentUser.id,
    autoConnect: true,
    serverUrl: process.env.NEXT_PUBLIC_CHAT_SERVER_URL,
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
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isLoading, loadConversations, currentChatUser]);

  // Improved typing indicators with debouncing
  useEffect(() => {
    if (!currentChatUser || !isConnected || !mountedRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (messageInput.length > 0) {
      startTyping(currentChatUser);
      typingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          stopTyping(currentChatUser);
        }
      }, 2000);
    } else {
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

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;

        try {
          const response = await fetch(
            `/api/users/search?q=${encodeURIComponent(query)}`,
            {
              credentials: "include",
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
        if (currentChatUser) {
          await leaveChat();
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        if (!mountedRef.current) return;

        await joinChat(userId);

        if (!mountedRef.current) return;

        setShowUserSearch(false);
        setSearchQuery("");
        setSearchResults([]);

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

  // Enhanced message sending with optimistic updates
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
      // The sendMessage function now handles optimistic updates internally
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
    window.location.reload();
  }, [clearError]);

  // Handle search change
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      searchUsers(query);
    },
    [searchUsers]
  );

  // Handle toggle user search
  const handleToggleUserSearch = useCallback(() => {
    setShowUserSearch(!showUserSearch);
  }, [showUserSearch]);

  // Handle clear error
  const handleClearError = useCallback(() => {
    clearError();
    setLocalError(null);
  }, [clearError]);

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      <ChatSidebar
        isConnected={isConnected}
        isSelectingUser={isSelectingUser}
        unreadCount={unreadCount}
        showUserSearch={showUserSearch}
        searchQuery={searchQuery}
        searchResults={searchResults}
        conversations={conversations}
        currentChatUser={currentChatUser}
        isLoading={isLoading}
        onRetryConnection={handleRetryConnection}
        onToggleUserSearch={handleToggleUserSearch}
        onSearchChange={handleSearchChange}
        onUserSelect={handleUserSelect}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {currentChatUserInfo ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              currentChatUserInfo={currentChatUserInfo}
              currentChatUser={currentChatUser}
              typingUsers={typingUsers}
              isSelectingUser={isSelectingUser}
              onLeaveChat={handleLeaveChat}
            />

            {/* Messages Area */}
            <MessagesList
              messages={messages}
              currentUserId={currentUser.id}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              messagesContainerRef={
                messagesContainerRef as React.RefObject<HTMLDivElement>
              }
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
              retryMessage={retryMessage}
            />

            {/* Message Input */}
            <MessageInput
              messageInput={messageInput}
              isConnected={isConnected}
              isSendingMessage={isSendingMessage}
              displayError={displayError}
              messageInputRef={
                messageInputRef as React.RefObject<HTMLInputElement>
              }
              onMessageChange={setMessageInput}
              onKeyPress={handleKeyPress}
              onSendMessage={handleSendMessage}
              onClearError={handleClearError}
            />
          </>
        ) : (
          // No Chat Selected State
          <EmptyState onStartNewChat={() => setShowUserSearch(true)} />
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
