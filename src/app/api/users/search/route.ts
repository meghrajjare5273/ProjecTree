// app/api/users/search/route.ts
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { CacheUtils, dbCache } from "@/lib/cache-utils";
import { CacheConfigs } from "@/lib/cache";

// Your existing types...
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  organizer: string;
}

export interface User {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
}

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

// Cached search functions
async function searchProjects(query: string): Promise<ProjectSearchResult[]> {
  const cacheKey = CacheUtils.generateKey.withPrefix(
    "search:projects",
    query.toLowerCase()
  );

  const projects = await dbCache.query(
    cacheKey,
    () =>
      prisma.project.findMany({
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
        },
        take: 5,
      }),
    CacheConfigs.MEDIUM.ttl
  );

  return (projects as Project[]).map((project: Project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    type: "project" as const,
    url: `/projects/${project.id}`,
  }));
}

async function searchEvents(query: string): Promise<EventSearchResult[]> {
  const cacheKey = CacheUtils.generateKey.withPrefix(
    "search:events",
    query.toLowerCase()
  );

  const events = await dbCache.query(
    cacheKey,
    () =>
      prisma.event.findMany({
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
        },
        take: 5,
      }),
    CacheConfigs.MEDIUM.ttl
  );

  return (events as Event[]).map((event: Event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    type: "event" as const,
    url: `/events/${event.id}`,
  }));
}

async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const cacheKey = CacheUtils.generateKey.withPrefix(
    "search:users",
    query.toLowerCase()
  );

  const users = await dbCache.query(
    cacheKey,
    () =>
      prisma.user.findMany({
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
        },
        take: 5,
      }),
    CacheConfigs.MEDIUM.ttl
  );

  return (users as User[]).map((user: User) => ({
    id: user.id,
    title: user.name || user.username || "Unknown User",
    username: user.username,
    type: "user" as const,
    url: `/users/${user.username}`,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] } as SearchResponse);
  }

  try {
    // Use cache wrapper for the entire search operation
    const cacheKey = CacheUtils.generateKey.withPrefix(
      "search:all",
      query.toLowerCase()
    );

    const results = await CacheUtils.withCache(
      "search",
      cacheKey,
      async () => {
        // Execute all searches in parallel
        const [projects, events, users] = await Promise.all([
          searchProjects(query),
          searchEvents(query),
          searchUsers(query),
        ]);

        return [...projects, ...events, ...users];
      },
      CacheConfigs.MEDIUM.ttl
    );

    return NextResponse.json({ results } as SearchResponse, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Cache-Status": "processed",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" } as SearchResponse, {
      status: 500,
    });
  }
}
