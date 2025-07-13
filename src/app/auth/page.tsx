"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const SignIn = dynamic(() => import("@/components/signin"), { ssr: false });
const SignUp = dynamic(() => import("@/components/signup"), { ssr: false });

// Loading fallback component with improved styling
function AuthFormSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="h-11 w-full bg-gray-700 rounded animate-pulse mt-4"></div>
      <div className="flex justify-center py-4">
        <div className="h-5 w-48 bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-11 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-11 bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Separate component to handle URL params
function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    if (searchParams) {
      const mode = searchParams.get("mode");
      return mode === "signin" || mode === "signup" ? mode : "signup";
    } else {
      return "signin";
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab changes
  const handleTabChange = (tab: "signin" | "signup") => {
    router.push(`?mode=${tab}`, { scroll: false });
    router.refresh();
    setActiveTab(tab);
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-stretch bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
      {/* Left Panel - Welcome Section */}
      <div className="lg:w-5/12 p-8 lg:p-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Welcome to ProjecTree
          </h1>
          <p className="text-gray-300 mb-8">
            Your journey starts here. Join our community and discover the power
            of collaborative innovations.
          </p>

          {/* Tab Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => handleTabChange("signin")}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                activeTab === "signin"
                  ? "bg-yellow-400 text-black font-semibold"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange("signup")}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                activeTab === "signup"
                  ? "bg-yellow-400 text-black font-semibold"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Sign Up
            </button>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Form Section */}
      <div className="lg:w-7/12 p-8 lg:p-12 bg-gray-900/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {isLoading ? (
              <AuthFormSkeleton />
            ) : activeTab === "signin" ? (
              <SignIn />
            ) : (
              <SignUp />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Main Auth Page component
export default function AuthPage() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/auth.webp"
          alt="Background"
          fill
          className={`object-cover transition-opacity duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          priority
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 backdrop-blur-sm" />
      </div>

      {/* Loading indicator while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main Content with Suspense */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full px-4 z-20"
      >
        <Suspense fallback={<LoadingFallback />}>
          <AuthContent />
        </Suspense>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-stretch bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
      <div className="lg:w-5/12 p-8 lg:p-12 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-8" />
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-700 rounded-full w-24" />
          <div className="h-10 bg-gray-700 rounded-full w-24" />
        </div>
      </div>
      <div className="lg:w-7/12 p-8 lg:p-12 bg-gray-900/50">
        <AuthFormSkeleton />
      </div>
    </div>
  );
}
