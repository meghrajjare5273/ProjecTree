/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface BiographyStepProps {
  userData: {
    bio: string | null;
    socialLinks: {
      website?: string;
      github?: string;
      twitter?: string;
      linkedin?: string;
      [key: string]: string | undefined;
    } | null;
    skills: string[];
    interests: string[];
    [key: string]: any;
  };
  updateUserData: (data: Partial<BiographyStepProps["userData"]>) => void;
}

export default function BiographyStep({
  userData,
  updateUserData,
}: BiographyStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "bio") {
      updateUserData({ bio: value.trim() ? value : null });
    } else if (name.startsWith("social.")) {
      const socialKey = name.split(".")[1];

      // Create a new socialLinks object, properly handling null/undefined
      const updatedSocialLinks = userData.socialLinks
        ? { ...userData.socialLinks }
        : {};

      if (value.trim()) {
        // Add prefix based on social platform if user doesn't include it
        let fullUrl = value;
        if (!value.startsWith("http")) {
          switch (socialKey) {
            case "website":
              fullUrl = `https://${value}`;
              break;
            case "github":
              fullUrl = `https://github.com/${value}`;
              break;
            case "twitter":
              fullUrl = `https://twitter.com/${value}`;
              break;
            case "linkedin":
              fullUrl = `https://www.linkedin.com/in/${value}`;
              break;
            default:
              fullUrl = value;
          }
        }

        // Set the value only if there's content
        updatedSocialLinks[socialKey] = fullUrl;
      } else {
        // Remove the key if it exists and is now empty
        if (socialKey in updatedSocialLinks) {
          delete updatedSocialLinks[socialKey];
        }
      }

      updateUserData({ socialLinks: updatedSocialLinks });
    }
  };

  // Extract usernames from full URLs for display
  const extractUsername = (url: string | undefined, prefix: string): string => {
    if (!url) return "";
    if (url.startsWith(prefix)) {
      return url.substring(prefix.length);
    }
    return url;
  };

  // Generate AI bio
  const generateAIBio = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // This is a placeholder - in a real implementation, you would call an AI service
      // to generate a bio based on the user's interests, skills, etc.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const generatedBio = `Passionate ${userData.skills
        .slice(0, 3)
        .join(", ")} enthusiast with a keen interest in ${userData.interests
        .slice(0, 3)
        .join(
          ", "
        )}. I'm dedicated to creating innovative solutions and collaborating with like-minded professionals.`;

      updateUserData({ bio: generatedBio });
    } catch (error) {
      console.error("Error generating bio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Biography & Social Links
      </h2>
      <p className="text-gray-300 mb-6">
        Tell others about yourself and connect your social profiles to enhance
        your network.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" className="text-white">
              Bio
            </Label>
            <Button
              type="button"
              onClick={generateAIBio}
              variant="outline"
              size="sm"
              className="text-xs border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50"
              disabled={
                isGenerating ||
                userData.skills.length === 0 ||
                userData.interests.length === 0
              }
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <textarea
            id="bio"
            name="bio"
            value={userData.bio || ""}
            onChange={handleInputChange}
            placeholder="Write a short bio about yourself..."
            rows={4}
            className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-md px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
          />
          <p className="text-gray-500 text-xs">
            {userData.bio ? userData.bio.length : 0}/300 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="social.website" className="text-white">
            Personal Website
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              https://
            </span>
            <input
              id="social.website"
              name="social.website"
              value={extractUsername(userData.socialLinks?.website, "https://")}
              onChange={handleInputChange}
              placeholder="yourwebsite.com"
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md pl-[4.5rem] pr-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Social Profiles</h3>

          <div className="space-y-2">
            <Label htmlFor="social.github" className="text-white">
              GitHub
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                github.com/
              </span>
              <input
                id="social.github"
                name="social.github"
                value={extractUsername(
                  userData.socialLinks?.github,
                  "https://github.com/"
                )}
                onChange={handleInputChange}
                placeholder="username"
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md pl-[6.5rem] pr-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social.twitter" className="text-white">
              Twitter
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                twitter.com/
              </span>
              <input
                id="social.twitter"
                name="social.twitter"
                value={extractUsername(
                  userData.socialLinks?.twitter,
                  "https://twitter.com/"
                )}
                onChange={handleInputChange}
                placeholder="username"
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md pl-[6.5rem] pr-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social.linkedin" className="text-white">
              LinkedIn
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                linkedin.com/in/
              </span>
              <input
                id="social.linkedin"
                name="social.linkedin"
                value={extractUsername(
                  userData.socialLinks?.linkedin,
                  "https://www.linkedin.com/in/"
                )}
                onChange={handleInputChange}
                placeholder="username"
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md pl-[8.5rem] pr-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
