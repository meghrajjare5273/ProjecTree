"use server";

import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import prisma from "./prisma";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function userSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        return redirect("/");
    } else {
        return session?.user;
    }
}

export const currentUser = async () => {
    const userData = await userSession();
    const userRedis = await redis.get(userData.id);
    if (!userRedis) {
        const user = await prisma.user.findFirst({
            where: {
                id: userData.id as string,
            },
            cacheStrategy: { swr: 60, ttl: 30 },
        });
        await redis.set(userData.id, user);
        redis.expire(userData.id, 60 * 30, "NX");
        return user;
    } else {
        return userRedis as typeof userSession;
    }
};
