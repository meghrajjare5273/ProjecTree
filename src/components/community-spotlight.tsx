"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

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
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Track loaded images
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const handleImageLoad = (username: string) => {
    setImagesLoaded((prev) => ({
      ...prev,
      [username]: true,
    }));
  };

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900">
        <motion.div
          style={{ y, opacity }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0, 1], [-50, 50]),
            opacity,
          }}
          className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className={`${playfair.className} text-4xl md:text-5xl font-bold text-white mb-6 `}
          >
            Community <span className="text-yellow-400">Spotlight</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg font-inter">
            Discover amazing projects created by students in our community. Get
            inspired and connect with fellow innovators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spotlightUsers.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -10px rgba(250, 204, 21, 0.2)",
              }}
              className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/30 transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-yellow-400/50 group-hover:border-yellow-400 transition-colors">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: imagesLoaded[user.username] ? 1 : 0,
                        scale: imagesLoaded[user.username] ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full"
                    >
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        fill
                        className="object-cover image-scale"
                        onLoad={() => handleImageLoad(user.username)}
                      />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg group-hover:text-yellow-400 transition-colors font-poppins">
                      {user.name}
                    </h3>
                    <p className="text-gray-400 text-sm font-inter">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-medium mb-2 text-lg font-poppins">
                    {user.project}
                  </h4>
                  <p className="text-gray-300 text-sm font-inter">
                    {user.description}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-inter">
                    {user.role}
                  </span>
                  <Link href={`/users/${user.username}`}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors flex items-center gap-1 group-hover:gap-2 font-inter"
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
