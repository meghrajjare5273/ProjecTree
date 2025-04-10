"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";
import { Box, Typography, Skeleton } from "@mui/material";
import type { Event } from "@prisma/client";

interface RelatedEventsProps {
  currentEventId: string;
}

type EventWithUser = Event & {
  user: {
    username: string | null;
    image: string | null;
  };
};

export default function RelatedEvents({ currentEventId }: RelatedEventsProps) {
  const [events, setEvents] = useState<EventWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          // Filter out current event and limit to 3 events
          const filteredEvents = data.data
            .filter((event: EventWithUser) => event.id !== currentEventId)
            .slice(0, 3);
          setEvents(filteredEvents);
        }
      } catch (error) {
        console.error("Error fetching related events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentEventId]);

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
          Related Events
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

  if (events.length === 0) {
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
        Related Events
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="bg-[#1a1a1a] border-[#333333] hover:border-[#444444] transition-colors"
          >
            <div className="relative h-40 w-full">
              <Image
                src={event.images[0] || "/placeholder.svg?height=160&width=320"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-4">
              <Link href={`/events/${event.id}`}>
                <h3 className="text-white font-semibold mb-2 hover:text-[#ffcc00] transition-colors line-clamp-1">
                  {event.title}
                </h3>
              </Link>

              <div className="flex items-center text-sm text-gray-400 mb-2">
                <CalendarDays className="h-4 w-4 mr-2 text-[#ffcc00]" />
                <span>
                  {new Date(event.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-[#ffcc00]" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}

              <Link href={`/events/${event.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#333333] text-[#ffcc00] hover:bg-[#ffcc00]/10"
                >
                  View Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Box>
  );
}
