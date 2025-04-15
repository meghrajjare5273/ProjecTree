"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Layers, Calendar, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import ProjectForm from "./ProjectForm";
import EventForm from "./EventForm";
import type User from "@/types/users";

interface PostFormContainerProps {
  user: User | null;
}

export default function PostFormContainer({ user }: PostFormContainerProps) {
  const [postType, setPostType] = useState<"project" | "event">("project");

  return (
    <Card className="bg-[#1a1a1a] border-[#333333] text-white overflow-hidden">
      <CardContent className="pt-6">
        {/* Post Type Selector */}
        <Tabs
          value={postType}
          onValueChange={(value) => setPostType(value as "project" | "event")}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#252525] p-1">
            <TabsTrigger
              value="project"
              className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
            >
              <Layers className="w-4 h-4 mr-2" />
              Project
            </TabsTrigger>
            <TabsTrigger
              value="event"
              className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Event
            </TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="mt-6">
            <ProjectForm user={user} />
          </TabsContent>

          <TabsContent value="event" className="mt-6">
            <EventForm user={user} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="border-t border-[#333333] bg-[#1a1a1a]/50 flex justify-between">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-sm"
        >
          Share your creativity with the community
        </motion.div>
      </CardFooter>
    </Card>
  );
}
