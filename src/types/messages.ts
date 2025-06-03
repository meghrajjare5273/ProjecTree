export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
  read: boolean | null;
  sending?: boolean;
  tempId?: string;
  sender?: {
    id: string;
    name: string;
    image?: string;
  };
}
