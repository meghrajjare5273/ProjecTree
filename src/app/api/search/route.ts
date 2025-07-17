/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type"); // 'project', 'event', 'user'
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchResults: any = {
      projects: [],
      events: [],
      users: [],
    };

    // Parallel search queries for better performance
    const searchPromises = [];

    if (!type || type === "project") {
      searchPromises.push(
        prisma.project
          .findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { tags: { hasSome: [query] } }, // Efficient array search
              ],
            },
            select: {
              id: true,
              title: true,
              description: true,
              tags: true,
              createdAt: true,
              user: {
                select: {
                  username: true,
                  image: true,
                },
              },
            },
            take: limit,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          })
          .then((results) => {
            searchResults.projects = results.map((project) => ({
              id: project.id,
              title: project.title,
              description: project.description,
              type: "project" as const,
              url: `/projects/${project.id}`,
              user: project.user,
              createdAt: project.createdAt,
            }));
          })
      );
    }

    if (!type || type === "event") {
      searchPromises.push(
        prisma.event
          .findMany({
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
              date: true,
              createdAt: true,
              user: {
                select: {
                  username: true,
                  image: true,
                },
              },
            },
            take: limit,
            orderBy: [
              { date: "asc" }, // Upcoming events first
              { id: "desc" },
            ],
          })
          .then((results) => {
            searchResults.events = results.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              type: "event" as const,
              url: `/events/${event.id}`,
              user: event.user,
              date: event.date,
              location: event.location,
            }));
          })
      );
    }

    if (!type || type === "user") {
      searchPromises.push(
        prisma.user
          .findMany({
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
              image: true,
              bio: true,
              _count: {
                select: {
                  followers: true,
                  projects: true,
                  events: true,
                },
              },
            },
            take: limit,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          })
          .then((results) => {
            searchResults.users = results.map((user) => ({
              id: user.id,
              title: user.name || user.username || "Unknown User",
              username: user.username,
              type: "user" as const,
              url: `/users/${user.username}`,
              image: user.image,
              bio: user.bio,
              stats: user._count,
            }));
          })
      );
    }

    // Execute all searches in parallel
    await Promise.all(searchPromises);

    // Combine and limit results
    const allResults = [
      ...searchResults.projects,
      ...searchResults.events,
      ...searchResults.users,
    ].slice(0, limit);

    return NextResponse.json(
      {
        results: allResults,
        breakdown: {
          projects: searchResults.projects.length,
          events: searchResults.events.length,
          users: searchResults.users.length,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      {
        status: 500,
      }
    );
  }
}
