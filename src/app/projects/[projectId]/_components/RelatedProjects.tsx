"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Typography, Skeleton } from "@mui/material";
import type { Project } from "@prisma/client";

interface RelatedProjectsProps {
  currentProjectId: string;
  tags?: string[];
}

type ProjectWithUser = Project & {
  user: {
    username: string | null;
    image: string | null;
  };
};

export default function RelatedProjects({
  currentProjectId,
  tags = [],
}: RelatedProjectsProps) {
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();

          // Filter out current project
          const filteredProjects = data.data.filter(
            (project: ProjectWithUser) => project.id !== currentProjectId
          );

          // If we have tags, prioritize projects with matching tags
          if (tags.length > 0) {
            filteredProjects.sort((a: ProjectWithUser, b: ProjectWithUser) => {
              const aMatchCount = a.tags.filter((tag: string) =>
                tags.includes(tag)
              ).length;
              const bMatchCount = b.tags.filter((tag: string) =>
                tags.includes(tag)
              ).length;
              return bMatchCount - aMatchCount;
            });
          }

          // Limit to 3 projects
          setProjects(filteredProjects.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching related projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [currentProjectId, tags]);

  if (isLoading) {
    return (
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "white",
            fontWeight: "bold",
            mb: 3,
          }}
        >
          Related Projects
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-[#1a1a1a] border-[#333333]">
              <Skeleton variant="rectangular" height={160} />
              <CardContent className="p-4">
                <Skeleton variant="text" height={28} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="40%" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Box>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 8 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          color: "white",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Related Projects
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-[#1a1a1a] border-[#333333] hover:border-[#444444] transition-colors"
          >
            <div className="relative h-40 w-full">
              <Image
                src={
                  project.images[0] || "/placeholder.svg?height=160&width=320"
                }
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-4">
              <Link href={`/projects/${project.id}`}>
                <h3 className="text-white font-semibold mb-2 hover:text-[#ffcc00] transition-colors line-clamp-1">
                  {project.title}
                </h3>
              </Link>

              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {project.description}
              </p>

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-[#252525] text-gray-300 hover:bg-[#333333] text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge className="bg-[#252525] text-gray-300 hover:bg-[#333333] text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Link href={`/projects/${project.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#333333] text-[#ffcc00] hover:bg-[#ffcc00]/10"
                >
                  View Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Box>
  );
}
