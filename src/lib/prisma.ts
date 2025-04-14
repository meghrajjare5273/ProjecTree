import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws"


// Connection pooling for better performance
neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL;


// Create a singleton to prevent multiple instances in development
const prismaClientSingleton = () => {
  // Use Neon serverless adapter for better performance
  if (connectionString && connectionString.includes("neon.tech")) {
    const adapter = new PrismaNeon({connectionString});
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({
    // Add query logging only in development
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
