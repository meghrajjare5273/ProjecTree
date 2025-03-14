import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { message: "Forbidden. User Must be Logged In To Create A Post." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({
        message: "No Image Provided For Posts.",
        status: 403,
      });
    }

    const blob = await put(
      `posts/${Date.now()}-${session.user.username}-${file.name}`,
      file,
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    return NextResponse.json({ status: 200 }, { url: blob.url });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Image Upload Failed" },
      { status: 400 }
    );
  }
}
