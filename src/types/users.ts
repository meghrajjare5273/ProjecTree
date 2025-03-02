type SocialLinks = {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    // Add any other social links you expect in the Json field
    [key: string]: string | undefined;
  };
  
  type User = {
    id: string;
    email: string;
    name?: string | null;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    username?: string | null;
    socialLinks?: SocialLinks | null;
    bio?: string | null;
  
    // Related entities (optional - include if you need them in your type)
    // sessions?: Session[];
    // accounts?: Account[];
    projects?: Project[];
    events?: Events[];
    comments?: Comment[];
  };
  
  type Project = {
    id: string;
    title: string;
    description: string;
    images: string[];
    tags: string[];
    //   userId: string;
    //   user: User;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
    type: "project"; // For distinguishing in combined posts array
  };
  
  type Events = {
    id: string;
    title: string;
    description: string;
    date: Date;
    location?: string;
    images: string[];
    organizer?: string;
    //   userId: string;
    //   user: User;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
    type: "event"; // For distinguishing in combined posts array
  };
  
  export default User;