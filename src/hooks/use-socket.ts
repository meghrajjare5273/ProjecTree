/* eslint-disable react-hooks/exhaustive-deps */
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
  // Add these optional fields for optimistic updates
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
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

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef(new Set<string>());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const reconnectAttemptsRef = useRef(0);
  const initializingRef = useRef(false);
  const pendingMessagesRef = useRef(new Map<string, Message>());
  const currentUserRef = useRef(currentUserId);

  const maxReconnectAttempts = 5;

  // Generate temporary ID for optimistic updates
  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create optimistic message
  const createOptimisticMessage = useCallback(
    (receiverId: string, content: string): Message => {
      const tempId = generateTempId();
      return {
        id: tempId,
        tempId,
        content,
        senderId: currentUserId,
        receiverId,
        createdAt: new Date().toISOString(),
        read: false,
        isPending: true,
        isFailed: false,
        sender: {
          id: currentUserId,
          name: null, // Will be filled from current user data
          username: null,
          image: null,
        },
      };
    },
    [currentUserId, generateTempId]
  );

  // Remove failed message
  const removeFailedMessage = useCallback((tempId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
    pendingMessagesRef.current.delete(tempId);
  }, []);

  // Mark message as failed
  const markMessageAsFailed = useCallback((tempId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === tempId
          ? { ...msg, isPending: false, isFailed: true }
          : msg
      )
    );
  }, []);

  // Replace optimistic message with real message
  const replaceOptimisticMessage = useCallback(
    (tempId: string, realMessage: Message) => {
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.tempId !== tempId);
        const newMessages = [...filtered, realMessage];
        return newMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      pendingMessagesRef.current.delete(tempId);
      messageIdsRef.current.add(realMessage.id);
    },
    []
  );

  // Stable event handlers
  const setupSocketListeners = useCallback((socket: Socket) => {
    // Connection events (keep exactly as original)
    socket.on("connect", () => {
      console.log("✅ Connected to chat server");
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;

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

        // Mark pending messages as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.isPending ? { ...msg, isPending: false, isFailed: true } : msg
          )
        );
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

      const currentChat = currentChatUser;
      if (currentChat) {
        socket.emit("join_chat", { otherUserId: currentChat });
      }
      socket.emit("get_conversations");
    });

    // Enhanced new_message handler for optimistic updates
    socket.on("new_message", (message: Message) => {
      console.log("📨 Received new message:", message);

      if (messageIdsRef.current.has(message.id)) {
        console.log("Duplicate message ignored:", message.id);
        return;
      }

      messageIdsRef.current.add(message.id);

      setMessages((prev) => {
        // Check if this message replaces a pending optimistic message
        const pendingIndex = prev.findIndex(
          (msg) =>
            msg.isPending &&
            msg.senderId === message.senderId &&
            msg.receiverId === message.receiverId &&
            msg.content === message.content &&
            Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(message.createdAt).getTime()
            ) < 10000
        );

        if (pendingIndex >= 0) {
          // Replace optimistic message with real message
          const updated = [...prev];
          updated[pendingIndex] = message;
          return updated.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }

        // Add new message normally
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

      // Update conversations (keep original logic)
      setConversations((prev) => {
        const isReceived = message.receiverId === currentUserRef.current;
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
            user_id: currentUserRef.current,
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

    // Add message_sent handler for optimistic update confirmations
    socket.on(
      "message_sent",
      ({
        messageId,
        tempId,
        status,
      }: {
        messageId: string;
        tempId?: string;
        status: string;
      }) => {
        console.log("✅ Global message sent confirmation:", {
          messageId,
          tempId,
          status,
        });
        // Individual message handlers will process this
      }
    );

    // Keep all other original event handlers exactly the same
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

    socket.on(
      "error",
      ({ message, tempId }: { message: string; tempId?: string }) => {
        console.error("❌ Socket error:", message);
        setError(message);
        setIsLoadingMore(false);

        if (tempId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId
                ? { ...msg, isPending: false, isFailed: true }
                : msg
            )
          );
        }
      }
    );
  }, []); // Empty dependency array to keep it stable

  // Join chat function
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
      pendingMessagesRef.current.clear();
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
    [isConnected, currentChatUser, currentUserId]
  );

  // Enhanced sendMessage with optimistic updates - FIXED
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

      // Create optimistic message
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const optimisticMessage: Message = {
        id: tempId,
        tempId,
        content: trimmedContent,
        senderId: currentUserId,
        receiverId,
        createdAt: new Date().toISOString(),
        read: false,
        isPending: true,
        isFailed: false,
        sender: {
          id: currentUserId,
          name: null,
          username: null,
          image: null,
        },
      };

      // Add optimistic message immediately
      setMessages((prev) => {
        const newMessages = [...prev, optimisticMessage];
        return newMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // Update conversation optimistically
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (conv) => conv.other_user_id === receiverId
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            content: trimmedContent,
            createdAt: optimisticMessage.createdAt,
          };
          return updated.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return prev;
      });

      // Send to server
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId
                ? { ...msg, isPending: false, isFailed: true }
                : msg
            )
          );
          reject(new Error("Message send timeout"));
        }, 15000);

        // Track if we've already resolved/rejected to prevent multiple calls
        let isSettled = false;

        const cleanup = () => {
          clearTimeout(timeout);
          socketRef.current?.off("message_sent", handleSent);
          socketRef.current?.off("error", handleError);
          socketRef.current?.off("new_message", handleNewMessage);
        };

        const settlePromise = (success: boolean, error?: string) => {
          if (isSettled) return;
          isSettled = true;
          cleanup();

          if (success) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.tempId === tempId ? { ...msg, isPending: false } : msg
              )
            );
            resolve();
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.tempId === tempId
                  ? { ...msg, isPending: false, isFailed: true }
                  : msg
              )
            );
            reject(new Error(error || "Failed to send message"));
          }
        };

        const handleSent = ({
          messageId,
          tempId: responseTempId,
          status,
        }: {
          messageId: string;
          tempId?: string;
          status: string;
        }) => {
          console.log("Message sent confirmation received:", {
            messageId,
            tempId: responseTempId,
            status,
            expectedTempId: tempId,
          });

          // Handle case where server doesn't send back tempId
          // We'll also listen for new_message as a backup
          if (responseTempId && responseTempId !== tempId) return;

          if (status === "delivered" || status === "success") {
            settlePromise(true);
          } else {
            settlePromise(false, `Failed to send message: ${status}`);
          }
        };

        const handleNewMessage = (message: any) => {
          // Check if this new message corresponds to our sent message
          if (
            message.senderId === currentUserId &&
            message.receiverId === receiverId &&
            message.content === trimmedContent
          ) {
            console.log(
              "Confirming message delivery via new_message event:",
              message
            );
            settlePromise(true);
          }
        };

        const handleError = (errorData: any) => {
          console.error("Message send error:", errorData);

          // Only handle errors for our specific message or general errors
          if (errorData.tempId && errorData.tempId !== tempId) return;

          settlePromise(false, errorData?.message || "Failed to send message");
        };

        // Set up listeners
        socketRef.current?.on("message_sent", handleSent);
        socketRef.current?.on("error", handleError);
        socketRef.current?.on("new_message", handleNewMessage);

        console.log("Sending message to server:", {
          receiverId,
          content: trimmedContent,
          tempId,
        });

        socketRef.current?.emit("send_message", {
          receiverId,
          content: trimmedContent,
          tempId,
        });
      });
    },
    [isConnected, currentUserId]
  );

  const retryMessage = useCallback(
    async (message: Message) => {
      if (!message.tempId || !message.isFailed) return;

      // Reset message state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === message.tempId
            ? { ...msg, isPending: true, isFailed: false }
            : msg
        )
      );

      try {
        await sendMessage(message.receiverId, message.content);
      } catch (error) {
        console.error("Failed to retry message:", error);
      }
    },
    [sendMessage]
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
    pendingMessagesRef.current.clear(); // Clear pending messages
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

  const connect = useCallback(async () => {
    if (!serverUrl || !currentUserId) {
      setError("Server URL or user ID missing");
      return;
    }

    try {
      // Fetch WebSocket authentication token
      const response = await fetch("/api/websocket-token", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch WebSocket token");
      }
      const { token } = await response.json();

      const socket = io(serverUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socketRef.current = socket;
      setupSocketListeners(socket);
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      setError("Failed to connect to chat server");
      setIsConnected(false);
    }
  }, [serverUrl, currentUserId, setupSocketListeners]);

  useEffect(() => {
    currentUserRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!autoConnect || !currentUserId || initializingRef.current) return;

    initializingRef.current = true;
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      initializingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      messageIdsRef.current.clear();
      pendingMessagesRef.current.clear();
    };
  }, [connect, autoConnect, currentUserId]);

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
    retryMessage,
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
