/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  name: string;
  image?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  sender: User;
  receiver: User;
}

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
}

interface UseWebSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  currentUserId: string | null;
  sendMessage: (
    receiverId: string,
    content: string
  ) => Promise<{ success: boolean; message?: Message; error?: string }>;
  markMessagesAsRead: (messageIds: string[]) => void;
  startTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  getConversationHistory: (
    userId: string,
    page?: number,
    limit?: number
  ) => void;
  getConversations: () => void;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  onlineUsers: Set<string>;
  typingUsers: Record<string, User>;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = ({
  serverUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL || "http://localhost:3001",
  autoConnect = true,
}: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, User>>({});

  const getSessionToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      console.log(acc);
      return acc;
    }, {} as Record<string, string>);
    return (
      cookies["better-auth.session_token"] ||
      cookies["session"] ||
      cookies["sessionId"] ||
      cookies["__Secure-better-auth.session_token"]
    );
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    setError(null);

    const sessionToken = getSessionToken();
    if (!sessionToken) {
      setError("No authentication token found");
      setIsConnecting(false);
      return;
    }

    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { sessionId: sessionToken },
      query: { sessionId: sessionToken },
      extraHeaders: { Cookie: document.cookie },
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on("connection:success", (data: { userId: string }) => {
      setCurrentUserId(data.userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
      setIsConnecting(false);
      if (reason === "io server disconnect") setError("Disconnected by server");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError(err.message || "Connection failed");
      setIsConnected(false);
      setIsConnecting(false);
    });

    socket.on("message:receive", (message: Message) => {
      console.log("Message received:", message);
      setMessages((prev) => {
        const senderId = message.senderId;
        const existing = prev[senderId] || [];
        if (existing.some((msg) => msg.id === message.id)) return prev;
        return {
          ...prev,
          [senderId]: [...existing, message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        };
      });
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.user.id === message.senderId
            ? {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + 1,
              }
            : conv
        );
        if (!updated.some((conv) => conv.user.id === message.senderId)) {
          updated.unshift({
            user: message.sender,
            lastMessage: message,
            unreadCount: 1,
            isOnline: onlineUsers.has(message.senderId),
          });
        }
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessage.createdAt).getTime() -
            new Date(a.lastMessage.createdAt).getTime()
        );
      });
    });

    socket.on("message:sent", (message: Message) => {
      console.log("Message sent:", message);
      setMessages((prev) => {
        const receiverId = message.receiverId;
        const existing = prev[receiverId] || [];
        if (existing.some((msg) => msg.id === message.id)) return prev;
        return {
          ...prev,
          [receiverId]: [...existing, message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        };
      });
    });

    socket.on(
      "message:read",
      (data: { messageIds: string[]; readBy: string; readByUser: User }) => {
        console.log("Messages read:", data);
        setMessages((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((userId) => {
            updated[userId] = updated[userId].map((msg) =>
              data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
            );
          });
          return updated;
        });
      }
    );

    socket.on("typing:start", (data: { userId: string; user: User }) => {
      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.user }));
    });

    socket.on("typing:stop", (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    socket.on("user:online", (data: { userId: string; user?: User }) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
      if (data.user) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user.id === data.userId ? { ...conv, isOnline: true } : conv
          )
        );
      }
    });

    socket.on("user:offline", (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === data.userId ? { ...conv, isOnline: false } : conv
        )
      );
    });

    socket.on("conversations:list", (conversationsList: Conversation[]) => {
      console.log("Conversations:", conversationsList);
      setConversations(conversationsList);
    });

    socket.on(
      "conversation:history",
      (data: { messages: Message[]; hasMore: boolean; page: number }) => {
        console.log("History received:", data);
        if (data.messages.length > 0 && currentUserId) {
          const firstMessage = data.messages[0];
          const otherUserId =
            firstMessage.senderId === currentUserId
              ? firstMessage.receiverId
              : firstMessage.senderId;
          setMessages((prev) => {
            const existing = prev[otherUserId] || [];
            const newMessages = data.messages.filter(
              (msg) => !existing.some((e) => e.id === msg.id)
            );
            return {
              ...prev,
              [otherUserId]: [...existing, ...newMessages].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            };
          });
        }
      }
    );

    socket.on("error", (errorMsg: string) => {
      console.error("Server error:", errorMsg);
      setError(errorMsg);
    });

    socketRef.current = socket;
  }, [serverUrl, getSessionToken]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      if (socketRef.current) disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const sendMessage = useCallback(
    (
      receiverId: string,
      content: string
    ): Promise<{ success: boolean; message?: Message; error?: string }> => {
      return new Promise((resolve) => {
        if (!socketRef.current?.connected) {
          resolve({ success: false, error: "Not connected" });
          return;
        }
        socketRef.current.emit(
          "message:send",
          { receiverId, content },
          (response: {
            success: boolean;
            message?: Message;
            error?: string;
          }) => {
            resolve(response);
          }
        );
      });
    },
    []
  );

  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message:read", { messageIds });
    }
  }, []);

  const startTyping = useCallback((receiverId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:start", { receiverId });
    }
  }, []);

  const stopTyping = useCallback((receiverId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:stop", { receiverId });
    }
  }, []);

  const getConversationHistory = useCallback(
    (userId: string, page = 1, limit = 50) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("conversation:history", { userId, page, limit });
      }
    },
    []
  );

  const getConversations = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("conversations:list");
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    currentUserId,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    getConversationHistory,
    getConversations,
    conversations,
    messages,
    onlineUsers,
    typingUsers,
    connect,
    disconnect,
  };
};
