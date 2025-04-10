import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";

// Import components
import ProjectHeader from "./_components/ProjectHeader";
import ProjectGallery from "./_components/ProjectGallery";
import ProjectDescription from "./_components/ProjectDescription";
import ProjectComments from "./_components/ProjectComments";
import RelatedProjects from "./_components/RelatedProjects";

export async function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    select: { title: true, description: true, tags: true },
  });

  if (!project) {
    return { title: "Project Not Found - ProjecTree" };
  }

  return {
    title: `${project.title} - ProjecTree`,
    description: project.description.substring(0, 160),
    openGraph: {
      title: project.title,
      description: project.description.substring(0, 160),
      type: "article",
      tags: project.tags,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch project data
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      user: {
        select: {
          username: true,
          image: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              username: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Fetch current user if logged in
  let currentUser = null;
  if (session) {
    currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-[#1a1a1a] border-[#333333] p-6 md:p-8">
          {/* Project Header */}
          <ProjectHeader project={project} />

          {/* Project Gallery */}
          <ProjectGallery images={project.images} title={project.title} />

          {/* Project Description */}
          <ProjectDescription description={project.description} />

          {/* Project Comments */}
          <ProjectComments
            projectId={project.id}
            comments={project.comments}
            currentUser={currentUser}
          />
        </Card>

        {/* Related Projects */}
        <RelatedProjects currentProjectId={project.id} tags={project.tags} />
      </div>
    </div>
  );
}
