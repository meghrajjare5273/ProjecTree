import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";

// src/app/api/conversations/route.ts
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations (unique users the current user has messaged with)
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by conversation partner and get the latest message
    const conversationMap = new Map();

    conversations.forEach((message) => {
      const partnerId =
        message.senderId === session.user.id
          ? message.receiverId
          : message.senderId;

      const partner =
        message.senderId === session.user.id
          ? message.receiver
          : message.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (message.receiverId === session.user.id && !message.read) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    const conversationsList = Array.from(conversationMap.values());

    return NextResponse.json({
      conversations: conversationsList,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
