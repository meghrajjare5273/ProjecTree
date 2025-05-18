import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma"; // Adjust path to your Prisma client

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch public projects, events, and user profiles
  const projects = await prisma.project.findMany({
    // where: { isPublic: true }, // Adjust based on your schema
    select: { id: true, updatedAt: true },
  });
  const events = await prisma.event.findMany({
    // where: { isPublic: true }, // Adjust based on your schema
    select: { id: true, updatedAt: true },
  });
  const users = await prisma.user.findMany({
    where: { username: { not: null } },
    select: { username: true, updatedAt: true },
  });

  // Generate URLs with metadata
  const projectUrls = projects.map((p) => ({
    loc: `https://projectree-blush.vercel.app/projects/${p.id}`,
    lastmod: p.updatedAt.toISOString(),
    priority: 0.8,
    changefreq: "daily",
  }));
  const eventUrls = events.map((e) => ({
    loc: `https://projectree-blush.vercel.app/events/${e.id}`,
    lastmod: e.updatedAt.toISOString(),
    priority: 0.8,
    changefreq: "daily",
  }));
  const userUrls = users.map((u) => ({
    loc: `https://projectree-blush.vercel.app/users/${u.username}`,
    lastmod: u.updatedAt.toISOString(),
    priority: 0.7,
    changefreq: "weekly",
  }));

  // Static pages
  const staticUrls = [
    {
      loc: "https://projectree-blush.vercel.app/",
      lastmod: new Date().toISOString(),
      priority: 1.0,
      changefreq: "daily",
    },
  ];

  const allUrls = [...staticUrls, ...projectUrls, ...eventUrls, ...userUrls];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (url) => `
    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <priority>${url.priority}</priority>
      <changefreq>${url.changefreq}</changefreq>
    </url>
  `
    )
    .join("")}
</urlset>`;

  // Set headers for XML and caching (1-hour cache)
  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
