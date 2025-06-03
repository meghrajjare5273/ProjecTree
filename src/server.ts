/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// server.ts (Create this file in your project root)
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import next from "next";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Dynamic imports for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic imports to handle module resolution
let auth: any;
let prisma: any;

async function loadModules() {
  try {
    const authModule = await import("./lib/auth");
    const prismaModule = await import("./lib/prisma");
    auth = authModule.auth;
    prisma = prismaModule.prisma;
  } catch (error) {
    console.error("Error loading modules:", error);
    process.exit(1);
  }
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

async function startServer() {
  // Load modules first
  await loadModules();

  // Create Next.js app
  const app = next({ dev, hostname, port });
  const handler = app.getRequestHandler();

  // Create Redis clients
  const pubClient = createClient({
    url: process.env.REDIS_URL!,
    password: process.env.KV_REST_API_TOKEN!,
  });

  const subClient = pubClient.duplicate();

  await app.prepare();

  try {
    // Connect Redis clients
    await pubClient.connect();
    await subClient.connect();
    console.log("Redis clients connected");
  } catch (error) {
    console.warn("Redis connection failed, continuing without Redis:", error);
  }

  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? "https://projectree-blush.vercel.app"
          : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Set up Redis adapter only if Redis is connected
  if (pubClient.isOpen && subClient.isOpen) {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis adapter configured");
  }

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error("No token provided"));
      }

      // Verify token with BetterAuth
      const session = await auth.api.getSession({
        headers: new Headers({
          authorization: `Bearer ${token}`,
          cookie: socket.handshake.headers.cookie || "",
        }),
      });

      if (!session) {
        return next(new Error("Invalid token"));
      }

      socket.data.userId = session.user.id;
      socket.data.user = session.user;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.userId);

    // Join user to their personal room for direct messages
    socket.join(`user:${socket.data.userId}`);

    // Handle sending messages
    socket.on("sendMessage", async ({ receiverId, content }) => {
      try {
        if (!content?.trim() || !receiverId) {
          socket.emit("error", { message: "Missing required fields" });
          return;
        }

        // Verify receiver exists
        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: { id: true },
        });

        if (!receiver) {
          socket.emit("error", { message: "Receiver not found" });
          return;
        }

        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            senderId: socket.data.userId,
            receiverId,
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
        });

        // Send to receiver
        io.to(`user:${receiverId}`).emit("receiveMessage", message);

        // Send confirmation to sender
        socket.emit("messageSent", message);

        console.log(`Message sent from ${socket.data.userId} to ${receiverId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle marking messages as read
    socket.on("markAsRead", async ({ messageIds }) => {
      try {
        await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
            receiverId: socket.data.userId,
          },
          data: { read: true },
        });

        socket.emit("messagesMarkedAsRead", { messageIds });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ receiverId, isTyping }) => {
      io.to(`user:${receiverId}`).emit("userTyping", {
        userId: socket.data.userId,
        userName: socket.data.user.name,
        isTyping,
      });
    });

    // Handle joining conversation rooms (optional for conversation-based UI)
    socket.on("joinConversation", async ({ otherUserId }) => {
      const conversationId = [socket.data.userId, otherUserId].sort().join(":");
      socket.join(`conversation:${conversationId}`);
      console.log(
        `User ${socket.data.userId} joined conversation ${conversationId}`
      );
    });

    socket.on("leaveConversation", ({ otherUserId }) => {
      const conversationId = [socket.data.userId, otherUserId].sort().join(":");
      socket.leave(`conversation:${conversationId}`);
      console.log(
        `User ${socket.data.userId} left conversation ${conversationId}`
      );
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.data.userId);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down gracefully");
    if (pubClient.isOpen) await pubClient.quit();
    if (subClient.isOpen) await subClient.quit();
    httpServer.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

// Start the server
startServer().catch(console.error);
