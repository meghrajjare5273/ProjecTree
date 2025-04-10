import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Project } from "@prisma/client";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface ProjectHeaderProps {
  project: Project & {
    user: {
      username: string | null;
      image: string | null;
    };
  };
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mb: 4,
      }}
    >
      <Badge className="w-fit bg-[#ffcc00] text-black hover:bg-[#e6b800]">
        Project
      </Badge>

      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: "white",
          fontWeight: "bold",
          fontSize: { xs: "1.75rem", md: "2.5rem" },
        }}
      >
        {project.title}
      </Typography>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag, index) => (
            <Badge
              key={index}
              className="bg-[#252525] text-gray-300 hover:bg-[#333333]"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center mt-2">
        <Link
          href={`/users/${project.user.username}`}
          className="flex items-center gap-2"
        >
          <Avatar className="h-8 w-8 border border-[#333333]">
            <Image
              src={
                (project.user.image as string) ||
                "/placeholder.svg?height=32&width=32"
              }
              alt={project.user.username || "User"}
              fill
              priority
            />
            {/* {console.log(project.user.image)} */}
            <AvatarFallback>
              {project.user.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">
              @{project.user.username}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>
      </div>
    </Box>
  );
}
