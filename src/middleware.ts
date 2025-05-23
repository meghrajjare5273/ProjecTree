import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
      },
    }
  );

  if (
    session &&
    (!session.user.username || session.user.username.trim() === "")
  ) {
    return NextResponse.redirect(new URL("/complete-profile", request.url));
  }

  if (!session) {
    return NextResponse.redirect(new URL("/auth?mode=signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/create-post"], // Apply middleware to specific routes
};
