/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/users/search/route.ts (for App Router) or pages/api/users/search.ts (for Pages Router)

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth"; // Adjust import path based on your auth setup

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Search users by name, username, or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: session.user.id, // Exclude current user
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        email: true, // Only include email for search purposes, don't expose in frontend
      },
      take: 10, // Limit results
    });

    // Remove email from response for privacy
    const sanitizedUsers = users.map(({ email, ...user }) => user);

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// For Pages Router, use this instead:
/*
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { q: query } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: session.user.id
            }
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                username: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
*/
