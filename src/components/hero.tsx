"use client";

import Image from "next/image";
import { motion } from "motion/react";
import Nav from "@/components/nav";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Darker overlay for better nav visibility */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Navigation wrapper with its own background gradient */}
      <div className="relative z-20">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
        <Nav />
      </div>

      <div className="relative h-screen">
        {/* Background Image with animation */}
        <motion.div
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={imageVariants}
        >
          <Image
            src="/pexels-buro-millennial-636760-1438072.jpg"
            alt="Educational concept"
            fill
            className="object-cover"
            priority
            // loading="lazy"
            quality={75}
          />
        </motion.div>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-20 z-10">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-2xl space-y-6"
            >
              {/* Descriptive Text */}
              <motion.p
                variants={fadeIn}
                className="text-white text-lg md:text-xl font-medium"
              >
                Join a thriving community of students sharing their stories
                about hackathons, cultural events, tech fests, workshops, and
                more.
              </motion.p>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight animate-fadeIn">
                Where <span className="text-yellow-400">innovation</span>
                <br />
                blooms <span className="text-yellow-400">alive.</span>
              </h1>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap gap-4 mt-8"
              >
                <Link href="auth">
                  <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-medium hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                    Join <b>ProjecTree</b>
                  </button>
                </Link>
                <button className="px-6 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                  Learn more
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 right-8 text-white/80 flex items-center gap-2 z-10"
        >
          Scroll down
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-bounce"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
