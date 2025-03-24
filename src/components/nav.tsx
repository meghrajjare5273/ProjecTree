//components/nav.tsx

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Nav() {
  return (
    <TooltipProvider>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 w-full z-50 px-6 py-6 font-sans"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-extrabold text-white relative tracking-tight"
            >
              Projec<span className="text-yellow-400 ">Tree</span>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-300 group-hover:w-full transition-all duration-300 rounded-full" />
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="text-white font-medium tracking-wide hover:text-black relative group px-6 py-2 overflow-hidden rounded-lg"
                  >
                    <span className="relative z-10">About</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-300 group-hover:w-full group-hover:left-0 transition-all duration-300" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-white/10 backdrop-blur-lg border-none text-white px-4 py-2">
                <p className="font-medium">Learn more about us</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/contact">
                  <Button
                    variant="ghost"
                    className="text-white font-medium tracking-wide hover:text-black relative group px-6 py-2 overflow-hidden rounded-lg"
                  >
                    <span className="relative z-10">Contact</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-300 group-hover:w-full group-hover:left-0 transition-all duration-300" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-white/10 backdrop-blur-lg border-none text-white px-4 py-2">
                <p className="font-medium">Get in touch with us</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Link href="/auth?mode=signin">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <Button
                variant="secondary"
                className="relative px-6 py-5 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-gray-900 font-semibold tracking-wide rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-none"
              >
                Sign in
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.nav>
    </TooltipProvider>
  );
}
