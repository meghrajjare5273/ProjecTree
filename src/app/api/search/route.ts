import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

// Define types for Projects
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  // Add other project fields if needed
}

// Define types for Events
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string | null;
  organizer: string | null;
  // Add other event fields if needed
}

// Define types for Users
export interface User {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  // Add other user fields if needed
}

// Define search result types
export type SearchResultType = "project" | "event" | "user";

export interface BaseSearchResult {
  id: string;
  title: string;
  type: SearchResultType;
  url: string;
}

export interface ProjectSearchResult extends BaseSearchResult {
  type: "project";
  description: string;
}

export interface EventSearchResult extends BaseSearchResult {
  type: "event";
  description: string;
}

export interface UserSearchResult extends BaseSearchResult {
  type: "user";
  username: string | null;
}

export type SearchResult =
  | ProjectSearchResult
  | EventSearchResult
  | UserSearchResult;

export interface SearchResponse {
  results: SearchResult[];
  error?: string;
}

// Updated function with proper type definitions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] } as SearchResponse);
  }

  try {
    // Search for projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
      },
      take: 5,
    });

    // Search for events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
          { organizer: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        organizer: true,
      },
      take: 5,
    });

    // Search for users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
      },
      take: 5,
    });

    // Format results
    const formattedProjects: ProjectSearchResult[] = projects.map(
      (project: Project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        type: "project" as const,
        url: `/projects/${project.id}`,
      })
    );

    const formattedEvents: EventSearchResult[] = events.map((event: Event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: "event" as const,
      url: `/events/${event.id}`,
    }));

    const formattedUsers: UserSearchResult[] = users.map((user: User) => ({
      id: user.id,
      title: user.name || user.username || "Unknown User",
      username: user.username,
      type: "user" as const,
      url: `/users/${user.username}`,
    }));

    // Combine results
    const results: SearchResult[] = [
      ...formattedProjects,
      ...formattedEvents,
      ...formattedUsers,
    ];

    return NextResponse.json({ results } as SearchResponse, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" } as SearchResponse, {
      status: 500,
    });
  }
}
