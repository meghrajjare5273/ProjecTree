"use client";
import { motion } from "motion/react";
import Image from "next/image";

const spotlightUsers = [
  {
    name: "Alex Johnson",
    username: "alexj",
    role: "Computer Science Student",
    image: "/placeholder.svg?height=80&width=80",
    project: "AI Study Assistant",
    description:
      "An AI-powered tool that helps students organize study materials and create personalized learning plans.",
  },
  {
    name: "Priya Sharma",
    username: "priyash",
    role: "Design Student",
    image: "/placeholder.svg?height=80&width=80",
    project: "Campus Event Finder",
    description:
      "A mobile app that aggregates all campus events in one place with personalized recommendations.",
  },
  {
    name: "Marcus Chen",
    username: "mchen",
    role: "Engineering Student",
    image: "/placeholder.svg?height=80&width=80",
    project: "Smart Campus Map",
    description:
      "An interactive 3D map of the campus with real-time information about building occupancy and events.",
  },
];

export default function CommunitySpotlight() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Community Spotlight
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover amazing projects created by students in our community. Get
            inspired and connect with fellow innovators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spotlightUsers.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-yellow-400">
                    <Image
                      src={user.image || "/placeholder.svg"}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{user.name}</h3>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-yellow-400 font-medium mb-2">
                    {user.project}
                  </h4>
                  <p className="text-gray-300 text-sm">{user.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">{user.role}</span>
                  <button className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
