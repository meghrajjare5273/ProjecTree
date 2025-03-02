import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword:{
        enabled: true
    },
    socialProviders:{
        google:{
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!
        },
        github:{
            clientId: process.env.GITHUB_AUTH_CLIENT_ID!,
            clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET!
        }
    },
    plugins:[
        username({
            usernameValidator(username) {
                if (username === "admin"){
                    return false
                }else {
                    return true
                }
            },
        })
    ]
});