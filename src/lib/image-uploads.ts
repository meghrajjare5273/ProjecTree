"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export default async function uploadImage(file : File){
    const blob = await put(file.name, file, {
        access: "public"
    })
    revalidatePath("/profile")
    return blob

}
