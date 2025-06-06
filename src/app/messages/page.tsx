"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/use-socket"; // Adjust path as needed

export default function ChatTestPage() {
  const {
    socket,
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
  } = useWebSocket();

  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  // Load conversations on connection
  useEffect(() => {
    if (isConnected) {
      getConversations();
    }
  }, [isConnected, getConversations]);

  // Handle typing indicators
  const handleTyping = (receiverId: string) => {
    startTyping(receiverId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(receiverId);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const result = await sendMessage(selectedConversation, messageText.trim());

    if (result.success) {
      setMessageText("");
      // Stop typing when message is sent
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(selectedConversation);
    } else {
      alert(`Failed to send message: ${result.error}`);
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    // Load conversation history
    getConversationHistory(userId);

    // Mark messages as read
    const userMessages = messages[userId] || [];
    const unreadMessages = userMessages.filter(
      (msg) => !msg.read && msg.senderId === userId
    );
    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map((msg) => msg.id));
    }
  };

  const currentMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];
  const selectedUser = conversations.find(
    (conv) => conv.user.id === selectedConversation
  )?.user;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              WebSocket Chat Test
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                {debugMode ? "Hide Debug" : "Show Debug"}
              </button>
              {!isConnected && !isConnecting && (
                <button
                  onClick={() => {
                    connect();
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Connect
                </button>
              )}
              {isConnected && (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected
                    ? "bg-green-500"
                    : isConnecting
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {isConnected
                  ? "Connected"
                  : isConnecting
                  ? "Connecting..."
                  : "Disconnected"}
              </span>
            </div>
            {currentUserId && (
              <span className="text-sm text-gray-600">
                User ID: {currentUserId}
              </span>
            )}
            {onlineUsers.size > 0 && (
              <span className="text-sm text-gray-600">
                Online: {onlineUsers.size}
              </span>
            )}
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700">
              Error: {error}
            </div>
          )}
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium">Socket Status:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(
                    {
                      connected: socket?.connected,
                      id: socket?.id,
                      transport: socket?.io?.engine?.transport?.name,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
              <div>
                <h3 className="font-medium">Online Users:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(Array.from(onlineUsers), null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-medium">Typing Users:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(typingUsers, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-medium">Conversations Count:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {conversations.length}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Interface */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Conversations</h2>
                <button
                  onClick={getConversations}
                  className="mt-2 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
                >
                  Refresh
                </button>
              </div>

              {conversations.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  No conversations yet
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      onClick={() =>
                        handleSelectConversation(conversation.user.id)
                      }
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conversation.user.id
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {conversation.user.name?.[0]?.toUpperCase() ||
                                "U"}
                            </div>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {conversation.user.name ||
                                `User ${conversation.user.id}`}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage.content}
                            </div>
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedUser?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedUser?.name || `User ${selectedConversation}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {onlineUsers.has(selectedConversation)
                            ? "Online"
                            : "Offline"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {currentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUserId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === currentUserId
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <div>{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.senderId === currentUserId
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                            {message.senderId === currentUserId && (
                              <span className="ml-1">
                                {message.read ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {typingUsers[selectedConversation] && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {typingUsers[selectedConversation].name} is
                              typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          handleTyping(selectedConversation);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isConnected}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!isConnected || !messageText.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">Test Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => getConversations()}
              disabled={!isConnected}
              className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 disabled:bg-gray-100 rounded"
            >
              Load Conversations
            </button>
            <button
              onClick={() =>
                selectedConversation &&
                getConversationHistory(selectedConversation)
              }
              disabled={!isConnected || !selectedConversation}
              className="px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-100 rounded"
            >
              Load History
            </button>
            <button
              onClick={() => {
                const testUserId = prompt("Enter user ID to test with:");
                if (testUserId) {
                  sendMessage(testUserId, "Test message from WebSocket tester");
                }
              }}
              disabled={!isConnected}
              className="px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 rounded"
            >
              Send Test Message
            </button>
            <button
              onClick={() => {
                console.log("Current state:", {
                  isConnected,
                  currentUserId,
                  conversations,
                  messages,
                  onlineUsers: Array.from(onlineUsers),
                  typingUsers,
                });
              }}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Log State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
