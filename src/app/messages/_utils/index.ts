"use server";
import { prisma } from "@/lib/prisma";

export async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
