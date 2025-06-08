import { prisma } from "@/lib/prisma";
import ChatComponent from "../_components/Chat";

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUserData(userId);

  return <ChatComponent currentUser={user} />;
}
