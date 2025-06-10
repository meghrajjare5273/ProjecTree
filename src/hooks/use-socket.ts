/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

export interface Message {
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
}

export interface Conversation {
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

export interface TypingUser {
  userId: string;
  isTyping: boolean;
}

interface UseChatOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

export const useChat = (options: UseChatOptions = {}) => {
  const {
    serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL ||
      "http://localhost:3001",
    autoConnect = true,
  } = options;

  // Core state
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentChatUser, setCurrentChatUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConnectingRef = useRef(false);
  const messageIdsRef = useRef(new Set<string>());
  const mountedRef = useRef(true);

  // Stable event handlers using useCallback with proper dependencies
  const handleConnect = useCallback(() => {
    if (!mountedRef.current) return;
    console.log("✅ Connected to chat server");
    setIsConnected(true);
    setError(null);
    isConnectingRef.current = false;
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    if (!mountedRef.current) return;
    console.log("❌ Disconnected from chat server:", reason);
    setIsConnected(false);
    isConnectingRef.current = false;

    if (reason !== "io client disconnect") {
      setError("Connection lost. Attempting to reconnect...");
    }
  }, []);

  const handleConnectError = useCallback((error: any) => {
    if (!mountedRef.current) return;
    console.error("❌ Connection error:", error);
    setError("Failed to connect to chat server");
    setIsConnected(false);
    isConnectingRef.current = false;
  }, []);

  const handleNewMessage = useCallback(
    (message: Message) => {
      if (!mountedRef.current) return;
      console.log("📨 Received new message:", message);

      setMessages((prev) => {
        // Check for duplicates
        if (messageIdsRef.current.has(message.id)) {
          return prev;
        }

        messageIdsRef.current.add(message.id);
        // Sort messages by creation date to maintain order
        const newMessages = [...prev, message].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return newMessages;
      });

      // Update conversations list with latest message or create new conversation
      setConversations((prev) => {
        const otherUserId =
          message.senderId === currentChatUser
            ? message.receiverId
            : message.senderId;
        const existingConvIndex = prev.findIndex(
          (conv) => conv.other_user_id === otherUserId
        );

        if (existingConvIndex >= 0) {
          // Update existing conversation
          const updatedConversations = [...prev];
          updatedConversations[existingConvIndex] = {
            ...updatedConversations[existingConvIndex],
            content: message.content,
            createdAt: message.createdAt,
            unread_count:
              message.senderId !== currentChatUser
                ? updatedConversations[existingConvIndex].unread_count + 1
                : updatedConversations[existingConvIndex].unread_count,
          };
          return updatedConversations.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          // Create new conversation for new user
          const newConversation: Conversation = {
            id: `conv_${otherUserId}`,
            other_user_id: otherUserId,
            content: message.content,
            createdAt: message.createdAt,
            name: message.sender.name,
            username: message.sender.username,
            image: message.sender.image,
            user_id: message.receiverId,
            unread_count: message.senderId !== currentChatUser ? 1 : 0,
          };
          return [newConversation, ...prev].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      });
    },
    [currentChatUser]
  );

  const handleChatHistory = useCallback((history: Message[]) => {
    if (!mountedRef.current) return;
    console.log("📜 Received chat history:", history.length, "messages");

    // Clear and rebuild message IDs
    messageIdsRef.current.clear();
    const sortedHistory = history.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedHistory.forEach((msg) => messageIdsRef.current.add(msg.id));
    setMessages(sortedHistory);
    setIsLoading(false);
  }, []);

  const handleConversations = useCallback((convs: Conversation[]) => {
    if (!mountedRef.current) return;
    console.log("💬 Received conversations:", convs.length);
    // Sort conversations by latest message
    const sortedConvs = convs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setConversations(sortedConvs);
  }, []);

  const handleUnreadCount = useCallback((count: number) => {
    if (!mountedRef.current) return;
    console.log("📧 Unread count updated:", count);
    setUnreadCount(count);
  }, []);

  const handleUserTyping = useCallback(({ userId, isTyping }: TypingUser) => {
    if (!mountedRef.current) return;
    console.log("⌨️ Typing indicator:", userId, isTyping);

    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      if (isTyping) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  const handleMessagesRead = useCallback(({ readBy }: { readBy: string }) => {
    if (!mountedRef.current) return;
    console.log("✅ Messages read by:", readBy);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.senderId === readBy ? { ...msg, read: true } : msg
      )
    );
  }, []);

  const handleError = useCallback(({ message }: { message: string }) => {
    if (!mountedRef.current) return;
    console.error("❌ Socket error:", message);
    setError(message);
  }, []);

  // Initialize socket connection with better cleanup
  useEffect(() => {
    if (
      !autoConnect ||
      isConnectingRef.current ||
      socketRef.current?.connected
    ) {
      return;
    }

    console.log("🔌 Initializing socket connection...");
    isConnectingRef.current = true;

    const newSocket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Set up event listeners
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("new_message", handleNewMessage);
    newSocket.on("chat_history", handleChatHistory);
    newSocket.on("conversations", handleConversations);
    newSocket.on("unread_count", handleUnreadCount);
    newSocket.on("user_typing", handleUserTyping);
    newSocket.on("messages_read", handleMessagesRead);
    newSocket.on("error", handleError);

    // Additional events
    newSocket.on("new_message_notification", (notification) => {
      console.log("🔔 New message notification:", notification);
    });

    newSocket.on("message_sent", ({ messageId, status }) => {
      console.log("📤 Message sent:", messageId, status);
    });

    socketRef.current = newSocket;

    return () => {
      console.log("🧹 Cleaning up socket connection...");
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
      socketRef.current = null;
      isConnectingRef.current = false;
    };
  }, [
    serverUrl,
    autoConnect,
    handleConnect,
    handleDisconnect,
    handleConnectError,
    handleNewMessage,
    handleChatHistory,
    handleConversations,
    handleUnreadCount,
    handleUserTyping,
    handleMessagesRead,
    handleError,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Connect manually
  const connect = useCallback(() => {
    if (
      socketRef.current &&
      !socketRef.current.connected &&
      !isConnectingRef.current
    ) {
      isConnectingRef.current = true;
      socketRef.current.connect();
    }
  }, []);

  // Disconnect manually
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  // Join a chat room with improved error handling
  const joinChat = useCallback(
    async (otherUserId: string) => {
      if (!socketRef.current || !isConnected) {
        const errorMsg = "Not connected to chat server";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!otherUserId) {
        const errorMsg = "Invalid user ID";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log("👥 Joining chat with:", otherUserId);
      setIsLoading(true);
      setMessages([]);
      messageIdsRef.current.clear();
      setError(null);

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          // For new conversations, we might not get chat_history, so resolve anyway
          console.log("⏰ Join chat timeout - assuming new conversation");
          setIsLoading(false);
          resolve();
        }, 5000); // Reduced timeout for better UX

        const handleHistoryOnce = (history: Message[]) => {
          clearTimeout(timeout);
          socketRef.current?.off("chat_history", handleHistoryOnce);
          setIsLoading(false);
          resolve();
        };

        // Handle both existing conversations and new ones
        const handleError = (error: any) => {
          clearTimeout(timeout);
          socketRef.current?.off("chat_history", handleHistoryOnce);
          socketRef.current?.off("error", handleError);
          setIsLoading(false);
          reject(error);
        };

        socketRef.current?.on("chat_history", handleHistoryOnce);
        socketRef.current?.on("error", handleError);
        socketRef.current?.emit("join_chat", { otherUserId });
      });
    },
    [isConnected]
  );

  const createLocalConversation = useCallback(
    (
      userId: string,
      userInfo?: { name?: string; username?: string; image?: string }
    ) => {
      setConversations((prev) => {
        const existingConv = prev.find((conv) => conv.other_user_id === userId);
        if (existingConv) return prev;

        const newConversation: Conversation = {
          id: `conv_${userId}`,
          other_user_id: userId,
          content: "",
          createdAt: new Date().toISOString(),
          name: userInfo?.name || null,
          username: userInfo?.username || null,
          image: userInfo?.image || null,
          user_id: currentChatUser || "",
          unread_count: 0,
        };
        return [newConversation, ...prev];
      });
    },
    [currentChatUser]
  );

  // Send a message with validation
  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      if (!socketRef.current || !isConnected) {
        const errorMsg = "Not connected to chat server";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!content.trim()) {
        const errorMsg = "Message cannot be empty";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!receiverId) {
        const errorMsg = "Invalid receiver ID";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log("📤 Sending message to:", receiverId);

      // Create local conversation if it doesn't exist
      const existingConv = conversations.find(
        (conv) => conv.other_user_id === receiverId
      );
      if (!existingConv) {
        createLocalConversation(receiverId);
      }

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          // Don't reject immediately, the message might still be sent
          console.log(
            "⏰ Send message timeout - but message may have been sent"
          );
          resolve(); // Resolve instead of reject to prevent error display
        }, 8000);

        const handleSentOnce = ({
          messageId,
          status,
        }: {
          messageId: string;
          status: string;
        }) => {
          clearTimeout(timeout);
          socketRef.current?.off("message_sent", handleSentOnce);
          if (status === "success") {
            resolve();
          } else {
            reject(new Error("Failed to send message"));
          }
        };

        const handleNewMessageOnce = (message: Message) => {
          // If we receive the message we just sent, consider it successful
          if (
            message.receiverId === receiverId &&
            message.content === content.trim()
          ) {
            clearTimeout(timeout);
            socketRef.current?.off("message_sent", handleSentOnce);
            socketRef.current?.off("new_message", handleNewMessageOnce);
            resolve();
          }
        };

        socketRef.current?.on("message_sent", handleSentOnce);
        socketRef.current?.on("new_message", handleNewMessageOnce);
        socketRef.current?.emit("send_message", {
          receiverId,
          content: content.trim(),
        });
      });
    },
    [isConnected, conversations, createLocalConversation]
  );

  const stopTyping = useCallback(
    (receiverId: string) => {
      if (!socketRef.current || !isConnected || !receiverId) return;

      socketRef.current.emit("typing_stop", { receiverId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [isConnected]
  );

  // Typing indicators with better cleanup
  const startTyping = useCallback(
    (receiverId: string) => {
      if (!socketRef.current || !isConnected || !receiverId) return;

      socketRef.current.emit("typing_start", { receiverId });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(receiverId);
      }, 3000);
    },
    [isConnected, stopTyping]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (senderId: string) => {
      if (!socketRef.current || !isConnected || !senderId) return;

      console.log("✅ Marking messages as read from:", senderId);
      socketRef.current.emit("mark_read", { senderId });
    },
    [isConnected]
  );

  // Load conversations
  const loadConversations = useCallback(() => {
    if (!socketRef.current || !isConnected) return;

    console.log("📋 Loading conversations...");
    socketRef.current.emit("get_conversations");
  }, [isConnected]);

  // Get conversation by user ID
  const getConversationByUserId = useCallback(
    (userId: string) => {
      return conversations.find((conv) => conv.other_user_id === userId);
    },
    [conversations]
  );

  // Leave current chat with proper cleanup
  const leaveChat = useCallback(async () => {
    console.log("👋 Leaving chat...");

    // Clean up typing indicators
    if (currentChatUser && typingTimeoutRef.current) {
      stopTyping(currentChatUser);
    }

    setMessages([]);
    messageIdsRef.current.clear();
    setIsLoading(false);
    setError(null);

    return Promise.resolve();
  }, [currentChatUser, stopTyping]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Connection state
    isConnected,
    isLoading,
    error,

    // Data
    messages,
    conversations,
    unreadCount,
    currentChatUser,
    setCurrentChatUser,
    typingUsers,

    // Actions
    connect,
    disconnect,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    loadConversations,
    clearError,

    // Utilities
    getConversationByUserId,
    messagesEndRef,
    createLocalConversation,
  };
};
