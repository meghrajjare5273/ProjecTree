"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Layers, Calendar, Users, Code, LayoutDashboard } from "lucide-react";
import { Playfair_Display } from "next/font/google";

// Load Playfair Display for elegant headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const features = [
  {
    title: "Connect with Students",
    description: "Find and collaborate with fellow students on campus.",
    icon: Users,
    stat: "5K+",
    statLabel: "Active users",
  },
  {
    title: "Share Projects & Events",
    description: "Showcase your projects and share campus events.",
    icon: Layers,
    stat: "1.2K+",
    statLabel: "Projects shared",
  },
  {
    title: "Discover Opportunities",
    description: "Find hackathons, workshops, and more.",
    icon: Calendar,
    stat: "300+",
    statLabel: "Events monthly",
  },
  {
    title: "Build Your Network",
    description:
      "Connect with like-minded individuals and build your professional network.",
    icon: Code,
    stat: "10K+",
    statLabel: "Connections made",
  },
  {
    title: "Dashboard",
    description: "Manage your projects, events, and profile.",
    icon: LayoutDashboard,
    stat: "24/7",
    statLabel: "Access anywhere",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-black/90">
        <motion.div
          style={{ y, opacity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0, 1], [-50, 50]),
            opacity,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-yellow-400 text-sm uppercase tracking-wider font-medium mb-3 block">
              What to expect
            </span>
            <h2
              className={`${playfair.variable} font-playfair text-5xl md:text-6xl font-bold text-white mb-8 leading-tight`}
            >
              We believe in a <span className="text-yellow-400">connected</span>{" "}
              campus community.
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl">
              ProjecTree is built on the idea that students thrive when they
              connect, share ideas, and build together. Our platform makes this
              possible in ways never seen before.
            </p>

            {/* Stats row */}
            <div className="border border-gray-800 rounded-lg p-6 grid grid-cols-3 gap-4">
              {[
                { value: "5K+", label: "Active users" },
                { value: "1.2K+", label: "Projects shared" },
                { value: "300+", label: "Monthly events" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-yellow-400 text-3xl md:text-4xl font-bold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column - Feature cards */}
          <div className="space-y-6">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex items-start hover:border-yellow-400/30 transition-all duration-300"
              >
                <div className="p-3 rounded-lg bg-yellow-400/10 text-yellow-400 mr-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-3">{feature.description}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-400 font-bold mr-2">
                      {feature.stat}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {feature.statLabel}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
