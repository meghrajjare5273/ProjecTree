"use client";

import React, { ReactNode } from "react";
import Sidebar from "./sidebar";

interface LayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<LayoutProps> = ({ children }) => {
  const currentUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=70", // Placeholder avatar
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentUser={currentUser} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default SidebarLayout;