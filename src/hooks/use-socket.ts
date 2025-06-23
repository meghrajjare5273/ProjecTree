/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { authClient } from "@/lib/auth-client";
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
    serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL,
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
  const [token, setToken] = useState<string | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef(new Set<string>());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const reconnectAttemptsRef = useRef(0);
  const initializingRef = useRef(false);

  const maxReconnectAttempts = 5;

  // Stable event handlers - These don't depend on state, preventing re-renders
  const setupSocketListeners = useCallback((socket: Socket) => {
    // Connection events
    socket.on("connect", () => {
      console.log("✅ Connected to chat server");
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;

      // Load conversations after connection
      setTimeout(() => {
        if (socket.connected) {
          socket.emit("get_conversations");
        }
      }, 500);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("❌ Disconnected from chat server:", reason);
      setIsConnected(false);

      if (reason !== "io client disconnect" && reason !== "transport close") {
        setError("Connection lost. Attempting to reconnect...");
      }
    });

    socket.on("connect_error", (error: any) => {
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
    });

    socket.on("reconnect", () => {
      console.log("🔄 Reconnected to chat server");
      setIsConnected(true);
      setError(null);

      // Re-join current chat and refresh conversations
      const currentChat = currentChatUser;
      if (currentChat) {
        socket.emit("join_chat", { otherUserId: currentChat });
      }
      socket.emit("get_conversations");
    });

    // Message events
    socket.on("new_message", (message: Message) => {
      console.log("📨 Received new message:", message);

      // Prevent duplicate messages
      if (messageIdsRef.current.has(message.id)) {
        console.log("Duplicate message ignored:", message.id);
        return;
      }

      messageIdsRef.current.add(message.id);

      // Update messages if we're in the current chat
      setMessages((prev) => {
        const currentChat = currentChatUser;
        const isInCurrentChat =
          currentChat &&
          (currentChat === message.senderId ||
            currentChat === message.receiverId);

        if (isInCurrentChat) {
          const newMessages = [...prev, message];
          return newMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        return prev;
      });

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
    });

    socket.on("chat_history", (history: Message[]) => {
      console.log("📜 Received chat history:", history.length, "messages");

      messageIdsRef.current.clear();
      const sortedHistory = history.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      sortedHistory.forEach((msg) => messageIdsRef.current.add(msg.id));
      setMessages(sortedHistory);
      setIsLoading(false);
    });

    socket.on("conversations", (convs: Conversation[]) => {
      console.log("💬 Received conversations:", convs.length);
      const sortedConvs = convs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (!currentChatUser) {
        setConversations(sortedConvs);
      }
    });

    socket.on("unread_count", (count: number) => {
      setUnreadCount(count);
    });

    socket.on("user_typing", ({ userId, isTyping }: TypingUser) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    socket.on("messages_read", ({ readBy }: { readBy: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === readBy ? { ...msg, read: true } : msg
        )
      );
    });

    socket.on("more_messages", (newMessages: Message[]) => {
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
      setIsLoadingMore(false);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.error("❌ Socket error:", message);
      setError(message);
      setIsLoadingMore(false);
    });
  }, []); // Empty dependency array - these handlers are stable

  useEffect(() => {
    const fetchToken = async () => {
      const session = authClient.getSession();
      const accessToken = (await session).data?.session.token;
      if (accessToken) {
        setToken(accessToken);
      }
    };
    fetchToken();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect || !currentUserId || initializingRef.current) {
      return;
    }

    console.log("🔌 Initializing socket connection for user:", currentUserId);
    initializingRef.current = true;

    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 200000,
      // auth: { token },
    });

    socketRef.current = socket;
    setupSocketListeners(socket);

    return () => {
      console.log("🧹 Cleaning up socket connection...");
      initializingRef.current = false;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      messageIdsRef.current.clear();
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, autoConnect, currentUserId, setupSocketListeners]);

  // Auto-scroll effect
  useEffect(() => {
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

  // API methods
  // Replace the joinChat function in your useChat hook with this fixed version:

  // Replace the existing joinChat function with this fixed version:

  const joinChat = useCallback(
    (otherUserId: string) => {
      if (!socketRef.current || !isConnected) {
        setError("Not connected to chat server");
        return Promise.reject(new Error("Not connected"));
      }

      if (!otherUserId?.trim()) {
        setError("Invalid user ID");
        return Promise.reject(new Error("Invalid user ID"));
      }

      if (currentChatUser === otherUserId) {
        return Promise.resolve();
      }

      console.log("Joining chat with user:", otherUserId);
      setCurrentChatUser(otherUserId);
      setIsLoading(true);
      setMessages([]);
      messageIdsRef.current.clear();
      setError(null);

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Join chat timeout"));
        }, 10000);

        socketRef.current?.emit(
          "join_chat",
          { otherUserId },
          (response: any) => {
            clearTimeout(timeout);

            if (response?.error) {
              console.error("Error joining chat:", response.error);
              setError(response.error);
              setIsLoading(false);
              reject(new Error(response.error));
            } else {
              let messages = [];
              let otherUser = null;

              if (typeof response === "object" && response !== null) {
                if (Array.isArray(response.messages)) {
                  messages = response.messages;
                }
                if (response.otherUser) {
                  otherUser = response.otherUser;
                }
              }

              console.log("Processing messages:", messages);
              console.log("Other user details:", otherUser);

              const sortedHistory = messages.sort(
                (a: any, b: any) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );

              messageIdsRef.current.clear();
              sortedHistory.forEach((msg: any) =>
                messageIdsRef.current.add(msg.id)
              );
              setMessages(sortedHistory);
              setIsLoading(false);

              // Add temporary conversation if it doesn't exist
              if (otherUser) {
                setConversations((prev) => {
                  const existingIndex = prev.findIndex(
                    (conv) => conv.other_user_id === otherUserId
                  );
                  if (existingIndex >= 0) {
                    return prev;
                  } else {
                    const newConv = {
                      id: `temp_${otherUserId}`,
                      other_user_id: otherUserId,
                      content: "",
                      createdAt: new Date().toISOString(),
                      name: otherUser.name,
                      username: otherUser.username,
                      image: otherUser.image,
                      user_id: currentUserId,
                      unread_count: 0,
                    };
                    return [newConv, ...prev].sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                  }
                });
              }

              resolve();
            }
          }
        );
      });
    },
    [isConnected, currentChatUser, conversations, currentUserId]
  );

  const sendMessage = useCallback(
    async (receiverId: string, content: string): Promise<void> => {
      if (!socketRef.current || !isConnected) {
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
        const timeout = setTimeout(() => {
          reject(new Error("Message send timeout"));
        }, 15000);

        const handleSent = ({
          messageId,
          status,
        }: {
          messageId: string;
          status: string;
        }) => {
          clearTimeout(timeout);
          socketRef.current?.off("message_sent", handleSent);
          socketRef.current?.off("error", handleError);

          if (status === "delivered") {
            resolve();
          } else {
            reject(new Error(`Failed to send message: ${status}`));
          }
        };

        const handleError = (errorData: any) => {
          clearTimeout(timeout);
          socketRef.current?.off("message_sent", handleSent);
          socketRef.current?.off("error", handleError);
          reject(new Error(errorData?.message || "Failed to send message"));
        };

        socketRef.current?.once("message_sent", handleSent);
        socketRef.current?.once("error", handleError);
        socketRef.current?.emit("send_message", {
          receiverId,
          content: trimmedContent,
        });
      });
    },
    [isConnected]
  );

  const loadMoreMessages = useCallback(() => {
    if (
      !socketRef.current ||
      !isConnected ||
      !currentChatUser ||
      isLoadingMore
    ) {
      return;
    }

    const oldestMessage = messages[0];
    if (!oldestMessage) return;

    setIsLoadingMore(true);
    socketRef.current.emit("load_more_messages", {
      otherUserId: currentChatUser,
      before: oldestMessage.createdAt,
    });
  }, [isConnected, currentChatUser, messages, isLoadingMore]);

  const startTyping = useCallback(
    (receiverId: string) => {
      if (!socketRef.current || !isConnected || !receiverId?.trim()) return;

      socketRef.current.emit("typing_start", { receiverId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("typing_stop", { receiverId });
        }
      }, 3000);
    },
    [isConnected]
  );

  const stopTyping = useCallback(
    (receiverId: string) => {
      if (!socketRef.current || !isConnected || !receiverId?.trim()) return;

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
      if (!socketRef.current || !isConnected || !senderId?.trim()) return;

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
    if (!socketRef.current || !isConnected) return;
    console.log("Loading conversations...");
    socketRef.current.emit("get_conversations");
  }, [isConnected]);

  const leaveChat = useCallback(() => {
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

  const getConversationByUserId = useCallback(
    (userId: string) =>
      conversations.find((conv) => conv.other_user_id === userId),
    [conversations]
  );

  const clearError = useCallback(() => setError(null), []);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
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
