import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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

  const [, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentChatUser, setCurrentChatUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Setup event listeners for socket
  const setupSocketListeners = useCallback((socketInstance: Socket) => {
    console.log("Setting up socket listeners...");

    // Remove existing listeners to prevent duplicates
    socketInstance.removeAllListeners();

    socketInstance.on("connect", () => {
      console.log("✅ Connected to chat server");
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from chat server:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setError("Failed to connect to chat server");
      setIsConnected(false);
    });

    // Message event listeners
    socketInstance.on("new_message", (message: Message) => {
      console.log("📨 Received new message:", message);
      setMessages((prev) => {
        // Prevent duplicate messages
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socketInstance.on("chat_history", (history: Message[]) => {
      console.log("📜 Received chat history:", history.length, "messages");
      setMessages(history);
      setIsLoading(false);
    });

    socketInstance.on("conversations", (convs: Conversation[]) => {
      console.log("💬 Received conversations:", convs.length);
      setConversations(convs);
    });

    socketInstance.on("unread_count", (count: number) => {
      console.log("📧 Unread count updated:", count);
      setUnreadCount(count);
    });

    socketInstance.on("user_typing", ({ userId, isTyping }: TypingUser) => {
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
    });

    socketInstance.on("new_message_notification", (notification) => {
      console.log("🔔 New message notification:", notification);
      // You can handle notifications here (toast, etc.)
    });

    socketInstance.on("messages_read", ({ readBy }) => {
      console.log("✅ Messages read by:", readBy);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === readBy ? { ...msg, read: true } : msg
        )
      );
    });

    socketInstance.on("message_sent", ({ messageId, status }) => {
      console.log("📤 Message sent:", messageId, status);
    });

    socketInstance.on("error", ({ message }) => {
      console.error("❌ Socket error:", message);
      setError(message);
    });

    console.log("✅ Socket listeners setup complete");
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    console.log("🔌 Initializing socket connection...");

    const newSocket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      forceNew: true, // Force a new connection
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    setupSocketListeners(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket connection...");
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
      socketRef.current = null;
    };
  }, [serverUrl, autoConnect, setupSocketListeners]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Connect manually
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  // Disconnect manually
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  // Join a chat room
  const joinChat = useCallback(
    (otherUserId: string) => {
      if (!socketRef.current || !isConnected) {
        setError("Not connected to chat server");
        return;
      }

      console.log("👥 Joining chat with:", otherUserId);
      setIsLoading(true);
      setCurrentChatUser(otherUserId);
      setMessages([]);
      socketRef.current.emit("join_chat", { otherUserId });
    },
    [isConnected]
  );

  // Send a message
  const sendMessage = useCallback(
    (receiverId: string, content: string) => {
      if (!socketRef.current || !isConnected) {
        setError("Not connected to chat server");
        return;
      }

      if (!content.trim()) {
        setError("Message cannot be empty");
        return;
      }

      console.log("📤 Sending message to:", receiverId);
      socketRef.current.emit("send_message", { receiverId, content });
      setError(null);
    },
    [isConnected]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (receiverId: string) => {
      if (!socketRef.current || !isConnected) return;

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
    [isConnected]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (receiverId: string) => {
      if (!socketRef.current || !isConnected) return;

      socketRef.current.emit("typing_stop", { receiverId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [isConnected]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (senderId: string) => {
      if (!socketRef.current || !isConnected) return;

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

  // Leave current chat
  const leaveChat = useCallback(() => {
    setCurrentChatUser(null);
    setMessages([]);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

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
  };
};
