import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Event } from "@prisma/client";
import { Box, Typography } from "@mui/material";

interface EventHeaderProps {
  event: Event & {
    user: {
      username: string | null;
      image: string | null;
    };
  };
}

export default function EventHeader({ event }: EventHeaderProps) {
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
        Event
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
        {event.title}
      </Typography>

      <div className="flex items-center gap-2 text-gray-400">
        <CalendarDays className="h-4 w-4 text-[#ffcc00]" />
        <span>
          {new Date(event.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span>•</span>
        <span>
          {new Date(event.date).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {event.location && (
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin className="h-4 w-4 text-[#ffcc00]" />
          <span>{event.location}</span>
        </div>
      )}

      {event.organizer && (
        <div className="flex items-center gap-2 text-gray-400">
          <User className="h-4 w-4 text-[#ffcc00]" />
          <span>Organized by: {event.organizer}</span>
        </div>
      )}

      <div className="flex items-center mt-2">
        <Link
          href={`/users/${event.user.username}`}
          className="flex items-center gap-2"
        >
          <Avatar className="h-8 w-8 border border-[#333333]">
            <AvatarImage
              src={event.user.image || "/placeholder.svg?height=32&width=32"}
              alt={event.user.username || "User"}
            />
            <AvatarFallback>
              {event.user.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">
              @{event.user.username}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(event.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>
      </div>
    </Box>
  );
}
