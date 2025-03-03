// src/types/posts.ts

// User type (simplified, as it's not fetched here)
type User = {
  id: string;
  username: string;
  image?: string;
};

// Comment type (simplified, as it's not fetched directly)
type Comment = {
  id: string;
  content: string;
  userId: string;
  user: User;
  projectId?: string;
  eventId?: string;
  createdAt: Date;
};

// Custom type for fetched projects
export type ExtendedProject = {
  type: "project";
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  createdAt: Date;
  commentCount: number;
};

// Custom type for fetched events
export type ExtendedEvent = {
  type: "event";
  id: string;
  title: string;
  description: string;
  images: string[];
  date: Date;
  location: string | null;
  organizer: string | null;
  createdAt: Date;
  commentCount: number;
};

// Union type for posts
export type ExtendedPost = ExtendedProject | ExtendedEvent;

// Original full types (optional, if needed elsewhere)
export type Project = {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  userId: string;
  user: User;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  type: "project";
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string | undefined;
  images: string[];
  organizer?: string;
  userId: string;
  user: User;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  type: "event";
};

export type Post = Project | Event;

export default Post;