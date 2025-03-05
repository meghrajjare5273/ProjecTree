"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  VStack,
  Badge,
  Image,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Define types for fetched data
type ProfileUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  socialLinks: Record<string, string>;
  createdAt: string;
};

type ExtendedPost = {
  id: string;
  title: string;
  description: string;
  type: "project" | "event";
  images?: string[];
  tags?: string[];
  date?: string;
  location?: string;
  createdAt: string;
  commentCount: number;
};

type ProfileData = {
  user: ProfileUser;
  posts: ExtendedPost[];
};

// Fetcher function
const fetchProfileData = async (username: string): Promise<ProfileData> => {
  const response = await fetch(`/api/users/${username}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }
  return response.json();
};

// Helper function to format dates
function formatDate(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await fetchProfileData(username);
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError("User not found or an error occurred");
        console.log(err);
        setLoading(false);
      }
    };
    loadProfileData();
  }, [username]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-br, gray.900, gray.800)"
      >
        <Spinner size="xl" color="yellow.400" />
      </Box>
    );
  }

  if (error || !profileData) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-br, gray.900, gray.800)"
      >
        <Text color="yellow.400" fontSize="lg">
          {error || "Profile not found"}
        </Text>
      </Box>
    );
  }

  const { user, posts } = profileData;

  return (
    <Box bgGradient="linear(to-br, gray.900, gray.800)" minH="100vh" py={20}>
      <Container maxW="5xl">
        {/* Profile Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box mb={8} bg="gray.800" p={6} borderRadius="xl" boxShadow="xl">
            <Flex direction={{ base: "column", md: "row" }} gap={6}>
              <Box>
                <Avatar.Root size="xl">
                  <Avatar.Fallback name={user.name || user.username} />
                  <Avatar.Image src={user.image as string} />
                </Avatar.Root>
                <Text color="gray.400" mt={2}>
                  Member since{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </Text>
              </Box>
              <Box flex={1}>
                <Heading as="h1" size="xl" color="white">
                  {user.name || user.username || "Anonymous"}
                </Heading>
                <Text color="yellow.400" mt={1}>
                  @{user.username}
                </Text>
                {user.bio && (
                  <Text color="gray.300" mt={2}>
                    {user.bio}
                  </Text>
                )}
                <Flex gap={2} mt={4} flexWrap="wrap">
                  {Object.entries(user.socialLinks).map(([platform, url]) => (
                    <Button
                      key={platform}
                      as="a"
                      onClick={() => {
                        router.push(url);
                      }}
                      // target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      colorScheme="yellow"
                      size="sm"
                    >
                      {platform}
                    </Button>
                  ))}
                  <Button colorScheme="yellow" size="sm">
                    Follow
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </Box>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="xl">
            <Heading
              as="h2"
              size="lg"
              color="white"
              mb={6}
              textAlign="center"
              position="relative"
            >
              {user.name || user.username}&apos;s Posts
              <Box
                position="absolute"
                bottom="-10px"
                left="50%"
                transform="translateX(-50%)"
                width="60px"
                height="3px"
                bgGradient="linear(to-r, yellow.400, yellow.400)"
                borderRadius="10px"
              />
            </Heading>
            {posts.length === 0 ? (
              <Text color="gray.400" textAlign="center">
                No posts yet.
              </Text>
            ) : (
              <VStack className="py-3">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Box
                      w="full"
                      bg="gray.700"
                      p={4}
                      borderRadius="lg"
                      boxShadow="md"
                    >
                      <Heading as="h3" size="md" color="white">
                        {post.title}{" "}
                        <Text as="span" color="yellow.400">
                          ({post.type})
                        </Text>
                      </Heading>
                      <Text color="gray.300" mt={2}>
                        {post.description}
                      </Text>
                      {post.images && post.images.length > 0 && (
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          borderRadius="md"
                          mt={2}
                          maxH="200px"
                          objectFit="cover"
                        />
                      )}
                      {post.type === "project" &&
                        post.tags &&
                        post.tags.length > 0 && (
                          <Flex gap={2} mt={2}>
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} colorScheme="yellow">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge colorScheme="yellow">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </Flex>
                        )}
                      {post.type === "event" && post.date && (
                        <Text color="gray.400" mt={2}>
                          Date: {new Date(post.date).toLocaleDateString()}
                          {post.location && ` | Location: ${post.location}`}
                        </Text>
                      )}
                      <Text color="gray.400" mt={2}>
                        Posted {formatDate(post.createdAt)} |{" "}
                        {post.commentCount} comments
                      </Text>
                      <Link href={`/${post.type}s/${post.id}`}>
                        <Button colorScheme="yellow" mt={2}>
                          View Details
                        </Button>
                      </Link>
                    </Box>
                  </motion.div>
                ))}
              </VStack>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
