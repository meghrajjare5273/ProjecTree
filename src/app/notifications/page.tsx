"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { Bell, Filter, Check, X } from "lucide-react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  type: "follow" | "comment" | "like" | "mention" | "event";
  message: string;
  timestamp: Date;
  read: boolean;
  user: {
    id: string;
    username: string;
    image: string | null;
  };
  link: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In a real implementation, you would fetch from your API
        // For now, we'll use mock data
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "follow",
            message: "started following you",
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            read: false,
            user: {
              id: "user1",
              username: "alexj",
              image: null,
            },
            link: "/users/alexj",
          },
          {
            id: "2",
            type: "comment",
            message: "commented on your project",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            user: {
              id: "user2",
              username: "priyash",
              image: null,
            },
            link: "/projects/1",
          },
          {
            id: "3",
            type: "like",
            message: "liked your event",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: true,
            user: {
              id: "user3",
              username: "mchen",
              image: null,
            },
            link: "/events/1",
          },
          {
            id: "4",
            type: "event",
            message: "A new event is happening near you",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true,
            user: {
              id: "system",
              username: "ProjecTree",
              image: null,
            },
            link: "/events/2",
          },
          {
            id: "5",
            type: "mention",
            message: "mentioned you in a comment",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            read: false,
            user: {
              id: "user4",
              username: "sarahk",
              image: null,
            },
            link: "/projects/2",
          },
          {
            id: "6",
            type: "follow",
            message: "started following you",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            read: true,
            user: {
              id: "user5",
              username: "michaelj",
              image: null,
            },
            link: "/users/michaelj",
          },
          {
            id: "7",
            type: "comment",
            message: "replied to your comment",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            read: true,
            user: {
              id: "user6",
              username: "emmaw",
              image: null,
            },
            link: "/projects/3",
          },
        ];

        setNotifications(mockNotifications);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "mentions") return notification.type === "mention";
    if (activeTab === "follows") return notification.type === "follow";
    if (activeTab === "comments") return notification.type === "comment";
    if (activeTab === "likes") return notification.type === "like";
    return true;
  });

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "follow":
        return "👤";
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "mention":
        return "@";
      case "event":
        return "📅";
      default:
        return "📣";
    }
  };

  // Get badge color based on notification type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "follow":
        return "bg-blue-500";
      case "comment":
        return "bg-green-500";
      case "like":
        return "bg-red-500";
      case "mention":
        return "bg-purple-500";
      case "event":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-[#ffcc00]" />
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#333333] text-gray-300 hover:bg-[#252525]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {notifications.some((n) => !n.read) && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#333333] text-[#ffcc00] hover:bg-[#252525]"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <Card className="bg-[#1a1a1a] border-[#333333]">
          <CardHeader className="pb-0">
            <CardTitle>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="bg-[#252525]">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                  >
                    Unread
                  </TabsTrigger>
                  <TabsTrigger
                    value="mentions"
                    className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                  >
                    Mentions
                  </TabsTrigger>
                  <TabsTrigger
                    value="follows"
                    className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                  >
                    Follows
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                  >
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="likes"
                    className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                  >
                    Likes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getIcon={getIcon}
                    getBadgeColor={getBadgeColor}
                  />
                </TabsContent>

                <TabsContent value="unread">
                  <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getIcon={getIcon}
                    getBadgeColor={getBadgeColor}
                  />
                </TabsContent>

                <TabsContent value="mentions">
                  <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getIcon={getIcon}
                    getBadgeColor={getBadgeColor}
                  />
                </TabsContent>

                <TabsContent value="follows">
                  <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getIcon={getIcon}
                    getBadgeColor={getBadgeColor}
                  />
                </TabsContent>

                <TabsContent value="comments">
                  <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getIcon={getIcon}
                    getBadgeColor={getBadgeColor}
                  />
                </TabsContent>

                <TabsContent value="likes">
                  <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getIcon={getIcon}
                    getBadgeColor={getBadgeColor}
                  />
                </TabsContent>
              </Tabs>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function NotificationList({
  notifications,
  loading,
  markAsRead,
  deleteNotification,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getIcon,
  getBadgeColor,
}: {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  getIcon: (type: string) => string;
  getBadgeColor: (type: string) => string;
}) {
  if (loading) {
    return (
      <CardContent className="p-4">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ffcc00]"></div>
        </div>
      </CardContent>
    );
  }

  if (notifications.length === 0) {
    return (
      <CardContent className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-400">No notifications found</p>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-0">
      <div className="divide-y divide-[#333333]">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-4 ${!notification.read ? "bg-[#252525]/50" : ""}`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border border-[#333333]">
                <AvatarImage
                  src={
                    notification.user.image ||
                    "/placeholder.svg?height=40&width=40"
                  }
                  alt={notification.user.username}
                />
                <AvatarFallback>
                  {notification.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getBadgeColor(
                      notification.type
                    )} text-white px-2 py-0.5 text-xs`}
                  >
                    {notification.type}
                  </Badge>
                  <span className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  <Link
                    href={`/users/${notification.user.username}`}
                    className="font-medium text-white hover:underline"
                  >
                    @{notification.user.username}
                  </Link>{" "}
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link href={notification.link}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-[#333333] text-gray-300 hover:bg-[#252525] text-xs"
                    >
                      View
                    </Button>
                  </Link>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-[#333333] text-[#ffcc00] hover:bg-[#252525] text-xs"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-white hover:bg-[#252525] h-7 w-7 p-0"
                onClick={() => deleteNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  );
}
