"use client";

import { motion } from "motion/react";
import { Layers, Calendar, Users, Code, LayoutDashboard } from "lucide-react";

const features = [
  {
    title: "Connect with Students",
    description: "Find and collaborate with fellow students on campus.",
    icon: Users,
  },
  {
    title: "Share Projects & Events",
    description: "Showcase your projects and share campus events.",
    icon: Layers,
  },
  {
    title: "Discover Opportunities",
    description: "Find hackathons, workshops, and more.",
    icon: Calendar,
  },
  {
    title: "Build Your Network",
    description:
      "Connect with like-minded individuals and build your professional network.",
    icon: Code,
  },
  {
    title: "Dashboard",
    description: "Manage your projects, events, and profile.",
    icon: LayoutDashboard,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white text-center mb-8"
        >
          Explore the Features
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="flex items-center mb-4">
                <feature.icon className="w-6 h-6 text-yellow-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
