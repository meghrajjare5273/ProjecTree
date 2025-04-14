/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "motion/react";

// Import components
import BiographyStep from "./_components/biography-step";
import InterestsStep from "./_components/interests-step";
import PersonalInfoStep from "./_components/personal-info-step";
import ProfileCompletionCard from "./_components/profile-completion-card";
import ProfilePhotoStep from "./_components/profile-photo-step";
import SkillsStep from "./_components/skills-step";
import StepIndicator from "./_components/step-indicator";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Types based on Prisma schema
type UserData = {
  id: string;
  username: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    [key: string]: string | undefined;
  } | null;
  // Additional fields for the form
  firstName: string;
  lastName: string;
  location: string;
  skills: string[];
  interests: string[];
  profilePhoto: string;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    id: "",
    username: "",
    name: "",
    email: "",
    image: null,
    bio: null,
    socialLinks: null,
    firstName: "",
    lastName: "",
    location: "",
    skills: [],
    interests: [],
    profilePhoto: "",
  });

  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.push("/auth?mode=signin");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });
      const { user } = await response.json();

      if (user) {
        // Split name into first and last name if available
        let firstName = "";
        let lastName = "";
        if (user.name) {
          const nameParts = user.name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        setUserData({
          id: user.id || "",
          username: user.username || "",
          name: user.name || "",
          email: user.email || "",
          image: user.image || null,
          bio: user.bio || "",
          socialLinks: user.socialLinks || {
            github: "",
            linkedin: "",
            twitter: "",
            website: "",
          },
          firstName,
          lastName,
          location: user.location || "",
          skills: user.skills || [],
          interests: user.interests || [],
          profilePhoto: user.image || "",
        });

        // Calculate initial completion percentage
        calculateCompletionPercentage({
          ...userData,
          username: user.username || "",
          bio: user.bio || "",
          image: user.image || null,
          socialLinks: user.socialLinks || null,
          skills: user.skills || [],
          interests: user.interests || [],
        });
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Update user data
  const updateUserData = (data: Partial<UserData>) => {
    const updatedData = { ...userData, ...data };
    setUserData(updatedData);
    calculateCompletionPercentage(updatedData);
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = (data: Partial<UserData>) => {
    let percentage = 0;

    // Basic info (20%)
    if (data.username && data.firstName && data.lastName) percentage += 20;

    // Profile photo (20%)
    if (data.profilePhoto || data.image) percentage += 20;

    // Interests (20%)
    if (data.interests && data.interests.length > 0) percentage += 20;

    // Skills (20%)
    if (data.skills && data.skills.length > 0) percentage += 20;

    // Bio and social links (20%)
    if (
      data.bio &&
      data.socialLinks &&
      (data.socialLinks.github ||
        data.socialLinks.linkedin ||
        data.socialLinks.twitter ||
        data.socialLinks.website)
    ) {
      percentage += 20;
    }

    setCompletionPercentage(percentage);
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare data for API
      const socialLinks = {
        github: userData.socialLinks?.github || "",
        linkedin: userData.socialLinks?.linkedin || "",
        twitter: userData.socialLinks?.twitter || "",
        website: userData.socialLinks?.website || "",
      };

      // Filter out empty values from socialLinks
      Object.keys(socialLinks).forEach((key) => {
        if (socialLinks[key as keyof typeof socialLinks] === "") {
          delete socialLinks[key as keyof typeof socialLinks];
        }
      });

      // Combine first and last name
      const name = `${userData.firstName} ${userData.lastName}`.trim();

      // Filter out empty or null values from interests and skills
      const filteredInterests = userData.interests.filter(
        (interest) => interest && interest.trim() !== ""
      );
      const filteredSkills = userData.skills.filter(
        (skill) => skill && skill.trim() !== ""
      );

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          name: name || null,
          bio: userData.bio || null,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          profileImage: userData.profilePhoto || null,
          skills: filteredSkills.length > 0 ? filteredSkills : [],
          interests: filteredInterests.length > 0 ? filteredInterests : [],
          location: userData.location || null,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pexels-enginakyurt-2943603.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 backdrop-blur-sm" />
        </div>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
          </motion.div>
          <motion.p
            className="text-gray-300 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading your profile...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/pexels-enginakyurt-2943603.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 backdrop-blur-sm" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-6 px-4 py-8"
      >
        {/* Left Panel - Welcome Section */}
        <div className="lg:w-1/3 space-y-6">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="bg-black/30 backdrop-blur-md rounded-xl border border-gray-800 p-6"
          >
            <h1 className="text-2xl font-bold text-white mb-4">
              Welcome to <span className="text-yellow-400">ProjecTree</span>
            </h1>
            <p className="text-gray-300 mb-6">
              Complete your profile to connect with other students, showcase
              your projects, and discover events on campus.
            </p>
            <StepIndicator currentStep={currentStep} totalSteps={5} />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProfileCompletionCard percentage={completionPercentage} />
          </motion.div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="lg:w-2/3">
          <Card className="bg-black/30 backdrop-blur-md border-gray-800 p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="personal-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PersonalInfoStep
                    userData={userData}
                    updateUserData={updateUserData}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="profile-photo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfilePhotoStep
                    userData={userData}
                    updateUserData={updateUserData}
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="interests"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <InterestsStep
                    userData={userData}
                    updateUserData={updateUserData}
                  />
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SkillsStep
                    userData={userData}
                    updateUserData={updateUserData}
                  />
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="biography"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BiographyStep
                    userData={userData}
                    updateUserData={updateUserData}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1 || loading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={loading}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-medium"
              >
                {currentStep === 5 ? "Complete Profile" : "Next Step"}
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
