"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Playfair_Display } from "next/font/google";

// Load Playfair Display for elegant headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* <span className="text-gray-400 text-sm uppercase tracking-wider">
            Call to action
          </span> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h2
            className={`${playfair.variable} font-playfair text-5xl md:text-7xl font-bold text-white mb-4`}
          >
            Let&apos;s discuss
          </h2>
          <p
            className={`${playfair.variable} font-playfair text-4xl md:text-6xl font-bold text-yellow-400 italic mb-12`}
          >
            your project!
          </p>

          <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-12">
            Ping us however you want, even if you don&apos;t have a brief.
            We&apos;re here to help you bring your campus project to life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group"
            >
              <Link href="/contact?mode=message">
                <button className="px-8 py-4 bg-gray-100 text-black font-medium rounded-md hover:bg-yellow-400 transition-colors flex items-center justify-center w-full sm:w-auto">
                  <Mail className="mr-2 h-5 w-5" />
                  Shoot a letter
                </button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group"
            >
              <Link href="/contact?mode=call">
                <button className="px-8 py-4 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center w-full sm:w-auto">
                  <Phone className="mr-2 h-5 w-5" />
                  Book a call
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
