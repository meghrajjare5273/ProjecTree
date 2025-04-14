"use client";

import { useEffect, useState } from "react";

export default function RootLoading() {
  const [progress, setProgress] = useState(0);

  // Simulate loading progress with fewer timeouts
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(50);
    }, 300);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 600);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Simplified background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-4xl md:text-5xl font-bold text-white">
            Projec<span className="text-yellow-400">Tree</span>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="w-64 md:w-80 mb-8">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-sm text-gray-400">
            {progress}%
          </div>
        </div>

        {/* Loading message */}
        <div className="flex flex-col items-center">
          <p className="text-gray-300 text-sm md:text-base">
            Loading your experience...
          </p>
        </div>
      </div>
    </div>
  );
}
