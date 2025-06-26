// src/app/api/websocket-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: session.user.id },
      process.env.WEBSOCKET_AUTH_SECRET!,
      { expiresIn: "5m" } // Short-lived token
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating WebSocket token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
