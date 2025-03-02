type User = {
    id: string;
    username: string;
    image?: string;
  };
  
  type Comment = {
    id: string;
    content: string;
    userId: string;
    user: User;
    projectId?: string;
    eventId?: string;
    createdAt: Date;
  };
  
  type Project = {
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
    type: "project"; // For distinguishing in combined posts array
  };
  
  type Event = {
    id: string;
    title: string;
    description: string;
    date: Date;
    location?: string;
    images: string[];
    organizer?: string;
    userId: string;
    user: User;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
    type: "event"; // For distinguishing in combined posts array
  };
  
  // Post type for the combined array
  type Post = Project | Event;
  
  export default Post;