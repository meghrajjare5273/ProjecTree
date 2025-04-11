"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  // Fetch notifications
  React.useEffect(() => {
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
        ];

        setNotifications(mockNotifications);
        setUnreadCount(
          mockNotifications.filter((notification) => !notification.read).length
        );
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notifications as read when opening the popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (newOpen && unreadCount > 0) {
      // In a real implementation, you would call your API to mark notifications as read
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-gray-300 hover:text-white hover:bg-[#252525]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ffcc00] text-[10px] font-bold text-black"
            >
              {unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-[#1a1a1a] border-[#333333]"
        align="end"
      >
        <Tabs defaultValue="all">
          <div className="border-b border-[#333333] px-3 py-2">
            <h4 className="text-sm font-medium text-white">Notifications</h4>
            <TabsList className="mt-2 bg-[#252525]">
              <TabsTrigger
                value="all"
                className="text-xs data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-xs data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger
                value="mentions"
                className="text-xs data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
              >
                Mentions
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </AnimatePresence>
            )}
          </TabsContent>
          <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : notifications.filter((n) => !n.read).length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No unread notifications
              </div>
            ) : (
              <AnimatePresence>
                {notifications
                  .filter((notification) => !notification.read)
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
              </AnimatePresence>
            )}
          </TabsContent>
          <TabsContent
            value="mentions"
            className="max-h-[300px] overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : notifications.filter((n) => n.type === "mention").length ===
              0 ? (
              <div className="p-4 text-center text-gray-400">
                No mentions yet
              </div>
            ) : (
              <AnimatePresence>
                {notifications
                  .filter((notification) => notification.type === "mention")
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
              </AnimatePresence>
            )}
          </TabsContent>
          <div className="border-t border-[#333333] p-2">
            <Link
              href="/notifications"
              className="block text-center text-sm text-[#ffcc00] hover:underline"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={notification.link}
        className={`block px-4 py-3 hover:bg-[#252525] ${
          !notification.read ? "bg-[#252525]/50" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border border-[#333333]">
            <AvatarImage
              src={
                notification.user.image || "/placeholder.svg?height=32&width=32"
              }
              alt={notification.user.username}
            />
            <AvatarFallback>
              {notification.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">
                @{notification.user.username}
              </span>{" "}
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>{getIcon()}</span>
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
              })}
            </p>
          </div>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-[#ffcc00]" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
