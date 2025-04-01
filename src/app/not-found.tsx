"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Dynamically import motion components to avoid hydration issues
const MotionDiv = dynamic(
  () => import("motion/react").then((mod) => ({ default: mod.motion.div })),
  { ssr: false }
);

export default function NotFound() {
  // Use state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);

  // Only render motion components after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render static content until hydration is complete
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="relative z-10 max-w-3xl w-full text-center">
          <div className="mb-6">
            <h1 className="text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 leading-none">
              404
            </h1>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Let&apos;s get you back on track.
            </p>
          </div>
          {/* Simplified static content during SSR */}
        </div>
      </div>
    );
  }

  // Render full content with animations after hydration
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* 404 Text */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 leading-none">
            404
          </h1>
        </MotionDiv>

        {/* Message */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
        </MotionDiv>

        {/* Illustration */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10 flex justify-center"
        >
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path
                  d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                  fill="none"
                  stroke="#ffcc00"
                  strokeWidth="6"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  className="animate-dash"
                />
              </svg>
              <div className="absolute">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Navigation Buttons */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-2 rounded-full flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Go to Home
            </Button>
          </Link>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-white text-black hover:bg-white/10 hover:text-white font-medium px-6 py-2 rounded-full flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </MotionDiv>
      </div>

      {/* ProjecTree Logo */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 text-center"
      >
        <Link href="/" className="text-2xl font-bold text-white">
          Projec<span className="text-[#ffcc00]">Tree</span>
        </Link>
      </MotionDiv>

      {/* Added global styles to tailwind config */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-dash {
          animation: dash 3s linear forwards;
        }
      `}</style>
    </div>
  );
}
