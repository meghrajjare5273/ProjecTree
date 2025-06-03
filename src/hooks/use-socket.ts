/* eslint-disable @typescript-eslint/no-unused-vars */
// hooks/use-socket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { authClient } from "@/lib/auth-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Get auth token for socket authentication
    const token = session.session.token;

    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        withCredentials: true,
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      }
    );

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [session]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

// Alternative hook for specific message functionality
export function useMessages(receiverId?: string) {
  const { socket, isConnected } = useSocket();
  const { data: session } = authClient.useSession(); // Get session data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for message sent confirmation
    socket.on("messageSent", (message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId && msg.tempId === message.tempId ? message : msg
        )
      );
    });

    // Listen for typing indicators
    socket.on("userTyping", ({ userId, userName, isTyping: typing }) => {
      if (typing) {
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== userId),
          userId,
        ]);
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
    });

    // Listen for errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.off("userTyping");
      socket.off("error");
    };
  }, [socket, isConnected]);

  const sendMessage = (content: string, tempId?: string) => {
    if (!socket || !receiverId || !content.trim() || !session?.user) return;

    // Optimistically add message to UI
    const optimisticMessage = {
      id: tempId || `temp-${Date.now()}`,
      tempId,
      content: content.trim(),
      senderId: session.user.id, // Get user ID from session
      receiverId,
      createdAt: new Date(),
      sending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("sendMessage", { receiverId, content: content.trim() });
  };

  const markAsRead = (messageIds: string[]) => {
    if (!socket) return;
    socket.emit("markAsRead", { messageIds });
  };

  const sendTyping = (isCurrentlyTyping: boolean) => {
    if (!socket || !receiverId) return;
    socket.emit("typing", { receiverId, isTyping: isCurrentlyTyping });
  };

  return {
    messages,
    setMessages,
    sendMessage,
    markAsRead,
    sendTyping,
    isTyping,
    typingUsers,
    isConnected,
  };
}
