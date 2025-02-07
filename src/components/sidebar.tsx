"use client"; // This is required for components that use client-side interactivity

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  MessageCircleIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  currentUser: {
    name: string;
    email: string;
    avatarUrl: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen flex flex-col justify-between border-r border-gray-200 dark:border-gray-800">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {currentUser.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentUser.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/home" className="group flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <HomeIcon className="w-5 h-5 text-gray-500 group-hover:text-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">Home</span>
        </Link>
        <Link href="/messages" className="group flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <MessageCircleIcon className="w-5 h-5 text-gray-500 group-hover:text-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">Messages</span>
        </Link>
        <Link href="/notifications" className="group flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <BellIcon className="w-5 h-5 text-gray-500 group-hover:text-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">Notifications</span>
        </Link>
        <Link href="/settings" className="group flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <SettingsIcon className="w-5 h-5 text-gray-500 group-hover:text-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">Settings</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="ghost" className="w-full justify-start">
          <LogOutIcon className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;