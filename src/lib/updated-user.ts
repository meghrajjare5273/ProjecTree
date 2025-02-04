"use server";

import { ProfileFormValues } from "@/components/profile-form";
//import { ProfileFormValues } from "@/app/profile/profile-page";
import prisma from "./prisma";
import { PutBlobResult } from "@vercel/blob";
// import { userSession } from "./types"

export async function updateUser(
    sessionId: string | undefined,
    data: ProfileFormValues
) {
    const updatedUser = await prisma.user.update({
        data: {
            username: data.username,
            email: data.email,
            name: data.name,
        },
        where: {
            id: sessionId,
        },
    });

    console.log(updatedUser);
}

export async function updateUserImage(
    userId: string | undefined,
    blob: PutBlobResult
) {
    const updatedImage = await prisma.user.update({
        data: {
            image: blob.url,
        },
        where: {
            id: userId,
        },
    });
    console.log(updatedImage);
}
