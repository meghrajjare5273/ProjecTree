"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen bg-[#121212] items-center justify-center p-4">
      <Card className="bg-[#1a1a1a] border-[#333333] max-w-md w-full">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-400 mb-6">
            We encountered an error while loading this profile. Please try
            again.
          </p>
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium"
            >
              Try again
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
              className="w-full border-[#333333] text-white hover:bg-[#252525] bg-transparent"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
