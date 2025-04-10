"use client";

import type React from "react";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { Box, Typography } from "@mui/material";
import type { Comment, User } from "@prisma/client";

interface ProjectCommentsProps {
  projectId: string;
  comments: (Comment & {
    user: {
      username: string | null;
      image: string | null;
    };
  })[];
  currentUser: User | null;
}

export default function ProjectComments({
  projectId,
  comments,
  currentUser,
}: ProjectCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !currentUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentText,
          projectId,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setLocalComments((prev) => [newComment.data, ...prev]);
        setCommentText("");
      } else {
        console.error("Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          color: "white",
          fontWeight: "bold",
          mb: 4,
        }}
      >
        Comments ({localComments.length})
      </Typography>

      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 border border-[#333333]">
              <AvatarImage
                src={currentUser.image || "/placeholder.svg?height=32&width=32"}
                alt={currentUser.name || "User"}
              />
              <AvatarFallback>
                {currentUser.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="bg-[#252525] border-[#333333] text-white min-h-20 focus-visible:ring-[#ffcc00]/50 mb-2"
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="bg-[#ffcc00] hover:bg-[#e6b800] text-black"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-[#252525] p-4 rounded-lg mb-6 text-center">
          <p className="text-gray-400">
            Please{" "}
            <a
              href="/auth?mode=signin"
              className="text-[#ffcc00] hover:underline"
            >
              sign in
            </a>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {localComments.length > 0 ? (
        <div className="space-y-4">
          {localComments.map((comment) => (
            <div key={comment.id} className="bg-[#252525]/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border border-[#333333]">
                  <AvatarImage
                    src={
                      comment.user.image ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt={comment.user.username || "User"}
                  />
                  <AvatarFallback>
                    {comment.user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">
                      @{comment.user.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-gray-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </Box>
  );
}
