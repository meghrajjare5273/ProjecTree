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
  currentUserId: string;
}

export const useChat = (options: UseChatOptions) => {
  const {
    serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL ||
      "http://localhost:3001",
    autoConnect = true,
    currentUserId,
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConnectingRef = useRef(false);
  const messageIdsRef = useRef(new Set<string>());
  const mountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Add cleanup flag to prevent multiple connections
  const cleanupRef = useRef(false);

  // Add connection stability tracking
  const connectionStableRef = useRef(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const maxReconnectAttempts = 5;

  // Enhanced cleanup function
  const cleanup = useCallback(() => {
    cleanupRef.current = true;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    messageIdsRef.current.clear();

    if (socketRef.current) {
      console.log("🧹 Cleaning up socket connection...");
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    isConnectingRef.current = false;
    connectionStableRef.current = false;
  }, []);

  // Stable event handlers
  const handleConnect = useCallback(() => {
    if (!mountedRef.current || cleanupRef.current) return;

    console.log("✅ Connected to chat server");
    setIsConnected(true);
    setError(null);
    isConnectingRef.current = false;
    reconnectAttemptsRef.current = 0;

    // Mark connection as stable after a brief delay
    connectionTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && !cleanupRef.current) {
        connectionStableRef.current = true;
        // Load conversations only after connection is stable
        if (socketRef.current?.connected) {
          console.log("🔄 Loading conversations after stable connection");
          socketRef.current.emit("get_conversations");
        }
      }
    }, 1000);
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    if (!mountedRef.current || cleanupRef.current) return;

    console.log("❌ Disconnected from chat server:", reason);
    setIsConnected(false);
    isConnectingRef.current = false;
    connectionStableRef.current = false;

    // Only show error if it's not an intentional disconnect
    if (reason !== "io client disconnect" && reason !== "transport close") {
      setError("Connection lost. Attempting to reconnect...");
    }
  }, []);

  const handleConnectError = useCallback((error: any) => {
    if (!mountedRef.current || cleanupRef.current) return;

    console.error("❌ Connection error:", error);
    reconnectAttemptsRef.current += 1;

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setError("Failed to connect to chat server. Please refresh the page.");
    } else {
      setError(
        `Connection failed. Retrying... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
      );
    }

    setIsConnected(false);
    isConnectingRef.current = false;
    connectionStableRef.current = false;
  }, []);

  // Fixed message handling with better deduplication
  const handleNewMessage = useCallback(
    (message: Message) => {
      if (!mountedRef.current || !currentUserId || cleanupRef.current) return;
      console.log("📨 Received new message:", message);

      // Prevent duplicate messages
      if (messageIdsRef.current.has(message.id)) {
        console.log("Duplicate message ignored:", message.id);
        return;
      }

      messageIdsRef.current.add(message.id);

      // Update messages if we're in the current chat
      const isInCurrentChat =
        currentChatUser &&
        (currentChatUser === message.senderId ||
          currentChatUser === message.receiverId);

      if (isInCurrentChat) {
        setMessages((prev) => {
          const newMessages = [...prev, message];
          return newMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }

      // Always update conversations
      setConversations((prev) => {
        const isReceived = message.receiverId === currentUserId;
        const otherUserId = isReceived ? message.senderId : message.receiverId;

        const existingIndex = prev.findIndex(
          (conv) => conv.other_user_id === otherUserId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          const isCurrentChat = currentChatUser === otherUserId;

          updated[existingIndex] = {
            ...updated[existingIndex],
            content: message.content,
            createdAt: message.createdAt,
            unread_count:
              isReceived && !isCurrentChat
                ? updated[existingIndex].unread_count + 1
                : updated[existingIndex].unread_count,
          };

          return updated.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else if (isReceived) {
          const newConv: Conversation = {
            id: `conv_${otherUserId}`,
            other_user_id: otherUserId,
            content: message.content,
            createdAt: message.createdAt,
            name: message.sender.name,
            username: message.sender.username,
            image: message.sender.image,
            user_id: currentUserId,
            unread_count: currentChatUser !== otherUserId ? 1 : 0,
          };

          return [newConv, ...prev].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        return prev;
      });
    },
    [currentUserId, currentChatUser]
  );

  // Handler for more messages
  const handleMoreMessages = useCallback((newMessages: Message[]) => {
    if (!mountedRef.current || cleanupRef.current) return;

    const uniqueNewMessages = newMessages.filter(
      (msg) => !messageIdsRef.current.has(msg.id)
    );

    if (uniqueNewMessages.length > 0) {
      setMessages((prev) => {
        const allMessages = [...uniqueNewMessages, ...prev];
        return allMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      uniqueNewMessages.forEach((msg) => messageIdsRef.current.add(msg.id));
    }
  }, []);

  // Function to load more messages
  const loadMoreMessages = useCallback(() => {
    if (
      !socketRef.current ||
      !isConnected ||
      !currentChatUser ||
      isLoadingMore ||
      cleanupRef.current
    )
      return;

    const oldestMessage = messages[0];
    if (!oldestMessage) return;

    setIsLoadingMore(true);
    socketRef.current.emit("load_more_messages", {
      otherUserId: currentChatUser,
      before: oldestMessage.createdAt,
    });

    // Handle response with cleanup check
    const handleMoreMessagesOnce = (newMessages: Message[]) => {
      if (!cleanupRef.current) {
        handleMoreMessages(newMessages);
        setIsLoadingMore(false);
      }
    };

    const handleErrorOnce = () => {
      if (!cleanupRef.current) {
        setIsLoadingMore(false);
      }
    };

    socketRef.current.once("more_messages", handleMoreMessagesOnce);
    socketRef.current.once("error", handleErrorOnce);
  }, [
    isConnected,
    currentChatUser,
    messages,
    isLoadingMore,
    handleMoreMessages,
  ]);

  // Improved auto-scroll with cleanup check
  useEffect(() => {
    if (cleanupRef.current) return;

    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (isAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleChatHistory = useCallback((history: Message[]) => {
    if (!mountedRef.current || cleanupRef.current) return;
    console.log("📜 Received chat history:", history); // Log full history
    console.log("📜 Chat history length:", history.length, "messages");

    // Clear existing message IDs and add new ones
    messageIdsRef.current.clear();
    const sortedHistory = history.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedHistory.forEach((msg) => messageIdsRef.current.add(msg.id));
    setMessages(sortedHistory);
    console.log("📜 Updated messages state with:", sortedHistory); // Log after update
    setIsLoading(false);
  }, []);

  const handleConversations = useCallback((convs: Conversation[]) => {
    if (!mountedRef.current || cleanupRef.current) return;
    console.log("💬 Received conversations:", convs.length);

    const sortedConvs = convs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setConversations(sortedConvs);
  }, []);

  const handleUnreadCount = useCallback((count: number) => {
    if (!mountedRef.current || cleanupRef.current) return;
    setUnreadCount(count);
  }, []);

  const handleUserTyping = useCallback(({ userId, isTyping }: TypingUser) => {
    if (!mountedRef.current || cleanupRef.current) return;

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
    if (!mountedRef.current || cleanupRef.current) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.receiverId === readBy ? { ...msg, read: true } : msg
      )
    );
  }, []);

  const handleError = useCallback(({ message }: { message: string }) => {
    if (!mountedRef.current || cleanupRef.current) return;
    console.error("❌ Socket error:", message);
    setError(message);
  }, []);

  // Initialize socket connection with better stability
  useEffect(() => {
    // Prevent multiple connections in development
    if (
      !autoConnect ||
      !currentUserId ||
      isConnectingRef.current ||
      socketRef.current?.connected ||
      cleanupRef.current
    ) {
      return;
    }

    console.log("🔌 Initializing socket connection for user:", currentUserId);
    isConnectingRef.current = true;

    const initSocket = async () => {
      try {
        const newSocket = io(serverUrl, {
          withCredentials: true,
          transports: ["websocket", "polling"],
          forceNew: false, // Changed to false to reuse connections
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          // Add connection stability options
          upgrade: true,
          rememberUpgrade: true,
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
        newSocket.on("more_messages", handleMoreMessages);

        socketRef.current = newSocket;
      } catch (error) {
        console.error("Error initializing socket:", error);
        setError("Failed to initialize connection");
        isConnectingRef.current = false;
      }
    };

    initSocket();

    return () => {
      cleanup();
    };
  }, [
    serverUrl,
    autoConnect,
    currentUserId,
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
    handleMoreMessages,
    cleanup,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    cleanupRef.current = false;

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Enhanced joinChat function with stability check
  const joinChat = useCallback(
    (otherUserId: string) => {
      if (!socketRef.current || !isConnected || cleanupRef.current) {
        setError("Not connected to chat server");
        return;
      }
      if (!otherUserId?.trim()) {
        setError("Invalid user ID");
        return;
      }
      if (currentChatUser === otherUserId) {
        return;
      }
      console.log("Joining chat with user:", otherUserId);
      setCurrentChatUser(otherUserId);
      setIsLoading(true);
      setMessages([]);
      messageIdsRef.current.clear();
      setError(null);
      socketRef.current.emit("join_chat", { otherUserId }, (response: any) => {
        if (response.error) {
          console.error("Error joining chat:", response.error);
          setError(response.error);
          setIsLoading(false);
        } else {
          // Handle the received messages
          const sortedHistory = response.messages.sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          messageIdsRef.current.clear();
          sortedHistory.forEach((msg: any) => messageIdsRef.current.add(msg.id));
          setMessages(sortedHistory);
          setIsLoading(false);
        }
      });
      console.log(`📤 Emitted join_chat for ${otherUserId}`);
    },
    [isConnected, currentChatUser]
  );

  // Enhanced sendMessage function
  const sendMessage = useCallback(
    async (receiverId: string, content: string): Promise<void> => {
      if (!socketRef.current || !isConnected || cleanupRef.current) {
        throw new Error("Not connected to chat server");
      }

      const trimmedContent = content?.trim();
      if (!trimmedContent) {
        throw new Error("Message cannot be empty");
      }

      if (trimmedContent.length > 1000) {
        throw new Error("Message too long (max 1000 characters)");
      }

      if (!receiverId?.trim()) {
        throw new Error("Invalid receiver ID");
      }

      return new Promise<void>((resolve, reject) => {
        if (!mountedRef.current || cleanupRef.current) {
          reject(new Error("Component unmounted"));
          return;
        }

        const timeout = setTimeout(() => {
          if (!cleanupRef.current) {
            reject(new Error("Message send timeout"));
          }
        }, 15000);

        const handleSentOnce = ({
          messageId,
          status,
        }: {
          messageId: string;
          status: string;
        }) => {
          if (cleanupRef.current) return;

          clearTimeout(timeout);
          socketRef.current?.off("message_sent", handleSentOnce);
          socketRef.current?.off("error", handleErrorOnce);

          if (status === "delivered") {
            resolve();
          } else {
            reject(new Error(`Failed to send message: ${status}`));
          }
        };

        const handleErrorOnce = (errorData: any) => {
          if (cleanupRef.current) return;

          clearTimeout(timeout);
          socketRef.current?.off("message_sent", handleSentOnce);
          socketRef.current?.off("error", handleErrorOnce);
          reject(new Error(errorData?.message || "Failed to send message"));
        };

        socketRef.current?.once("message_sent", handleSentOnce);
        socketRef.current?.once("error", handleErrorOnce);
        socketRef.current?.emit("send_message", {
          receiverId,
          content: trimmedContent,
        });
      });
    },
    [isConnected]
  );

  // Typing functions with cleanup checks
  const startTyping = useCallback(
    (receiverId: string) => {
      if (
        !socketRef.current ||
        !isConnected ||
        !receiverId?.trim() ||
        cleanupRef.current
      )
        return;

      socketRef.current.emit("typing_start", { receiverId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && socketRef.current && !cleanupRef.current) {
          socketRef.current.emit("typing_stop", { receiverId });
        }
      }, 3000);
    },
    [isConnected]
  );

  const stopTyping = useCallback(
    (receiverId: string) => {
      if (
        !socketRef.current ||
        !isConnected ||
        !receiverId?.trim() ||
        cleanupRef.current
      )
        return;

      socketRef.current.emit("typing_stop", { receiverId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [isConnected]
  );

  const markAsRead = useCallback(
    (senderId: string) => {
      if (
        !socketRef.current ||
        !isConnected ||
        !senderId?.trim() ||
        cleanupRef.current
      )
        return;

      socketRef.current.emit("mark_read", { senderId });

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === senderId ? { ...msg, read: true } : msg
        )
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.other_user_id === senderId ? { ...conv, unread_count: 0 } : conv
        )
      );
    },
    [isConnected]
  );

  const loadConversations = useCallback(() => {
    if (!socketRef.current || !isConnected || cleanupRef.current) return;
    console.log("Loading conversations...");
    socketRef.current.emit("get_conversations");
  }, [isConnected]);

  const getConversationByUserId = useCallback(
    (userId: string) =>
      conversations.find((conv) => conv.other_user_id === userId),
    [conversations]
  );

  const leaveChat = useCallback(async () => {
    if (currentChatUser && typingTimeoutRef.current) {
      stopTyping(currentChatUser);
    }

    setCurrentChatUser(null);
    setMessages([]);
    messageIdsRef.current.clear();
    setIsLoading(false);
    setError(null);
    setTypingUsers(new Set());

    return Promise.resolve();
  }, [currentChatUser, stopTyping]);

  const clearError = useCallback(() => setError(null), []);

  const connect = useCallback(() => {
    if (
      socketRef.current &&
      !socketRef.current.connected &&
      !isConnectingRef.current &&
      !cleanupRef.current
    ) {
      isConnectingRef.current = true;
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current && !cleanupRef.current) {
      socketRef.current.disconnect();
    }
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
    isLoadingMore,
    loadMoreMessages,
    messagesContainerRef,
  };
};
