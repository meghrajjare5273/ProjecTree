export type userSession = {
    id: string;
    username: string | null;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    name: string | null;
    image: string | null;
};

export type userSessionSidebar = {
    id: string;
    username: string | null;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    name: string | null;
    image: string | null;
};
