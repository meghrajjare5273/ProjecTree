import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { User, Session } from "better-auth/types";

const SECRET_KEY = process.env.JWT_SECRET_KEY!;

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_AUTH_CLIENT_ID!,
      clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET!,
    },
  },
  
  callbacks: {
    async afterSignIn({ user, session }: { user: User; session: Session }) {
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      console.log("Token: ", token);
      return { ...session, token };
    },
  },

  plugins: [
    username({
      usernameValidator(username) {
        if (username === "admin") {
          return false;
        } else {
          return true;
        }
      },
    }),
  ],
});
