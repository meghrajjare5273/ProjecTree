"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

// UI Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Icons
import {
  Calendar,
  Clock,
  FileImage,
  Home,
  Info,
  Layers,
  MapPin,
  Plus,
  Tag,
  Upload,
  User,
  X,
  ChevronLeft,
} from "lucide-react";
import { default as UserType } from "@/types/users";

// Define schemas for validation
const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().optional(),
  organizer: z.string().optional(),
});

// Define separate types for the forms
type ProjectFormData = z.infer<typeof projectSchema>;
type EventFormData = z.infer<typeof eventSchema>;

// Function to upload images to /api/upload
const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload-posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      const data = await response.json();
      console.log("Upload response:", data); // Add this for debugging
      return data.url;
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    return []; // Return empty array instead of failing
  }
};

export default function CreatePost() {
  const router = useRouter();
  const [postType, setPostType] = useState<"project" | "event">("project");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUser();
  }, []);

  // Create separate form instances for each type
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      organizer: "",
    },
  });

  // Handle file selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);

    newFiles.splice(index, 1);
    newUrls.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const onSubmitProject = async (data: ProjectFormData) => {
    try {
      setIsLoading(true);
      toast.loading("Creating your project...");

      // Upload images and get URLs
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(selectedFiles);
      }

      // Convert comma-separated tags to array
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        : [];

      // Prepare post data with image URLs
      const postData = {
        ...data,
        images: imageUrls,
        tags: tagsArray,
      };
      console.log(postData);

      // Submit to API
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Project created successfully");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.dismiss();
        toast.error(error.message || "Failed to create project");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while creating the project");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEvent = async (data: EventFormData) => {
    try {
      setIsLoading(true);
      toast.loading("Creating your event...");

      // Upload images and get URLs
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(selectedFiles);
      }

      // Combine date and time if time is provided
      const dateTime = data.time
        ? new Date(`${data.date}T${data.time}`)
        : new Date(data.date);

      // Prepare post data with image URLs
      const postData = {
        title: data.title,
        description: data.description,
        date: dateTime.toISOString(),
        location: data.location,
        organizer: data.organizer,
        images: imageUrls,
      };

      // Submit to API
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Event created successfully");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.dismiss();
        toast.error(error.message || "Failed to create event");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while creating the event");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#333333] py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-white text-xl font-bold">
              Create New {postType === "project" ? "Project" : "Event"}
            </h1>
          </div>
          <Link href="/" className="text-2xl font-bold text-white">
            Projec<span className="text-[#ffcc00]">Tree</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-[#1a1a1a] border-[#333333] text-white overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#ffcc00]" />
              Create a New Post
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Post Type Selector */}
            <Tabs
              value={postType}
              onValueChange={(value) =>
                setPostType(value as "project" | "event")
              }
              className="mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 bg-[#252525] p-1">
                <TabsTrigger
                  value="project"
                  className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Project
                </TabsTrigger>
                <TabsTrigger
                  value="event"
                  className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-black"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Event
                </TabsTrigger>
              </TabsList>

              <TabsContent value="project" className="mt-6">
                <form
                  onSubmit={projectForm.handleSubmit(onSubmitProject)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="project-title"
                      className="text-white flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-[#ffcc00]" />
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="project-title"
                      placeholder="Enter a descriptive title for your project"
                      className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                      {...projectForm.register("title")}
                    />
                    {projectForm.formState.errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {projectForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="project-description"
                      className="text-white flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-[#ffcc00]" />
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe your project in detail"
                      className="bg-[#252525] border-[#333333] text-white min-h-32 focus-visible:ring-[#ffcc00]/50"
                      {...projectForm.register("description")}
                    />
                    {projectForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {projectForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="project-tags"
                      className="text-white flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4 text-[#ffcc00]" />
                      Tags
                    </Label>
                    <Input
                      id="project-tags"
                      placeholder="Enter tags separated by commas (e.g., web, AI, hackathon)"
                      className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                      {...projectForm.register("tags")}
                    />
                    <p className="text-gray-400 text-xs">
                      Tags help others discover your project
                    </p>
                  </div>

                  <Separator className="bg-[#333333] my-6" />

                  <div className="space-y-4">
                    <Label className="text-white flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-[#ffcc00]" />
                      Images
                    </Label>

                    <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 text-center hover:border-[#ffcc00]/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="project-images"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="project-images"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="w-10 h-10 text-gray-400" />
                        <p className="text-gray-300 font-medium">
                          Drag & drop images or{" "}
                          <span className="text-[#ffcc00]">browse</span>
                        </p>
                        <p className="text-gray-500 text-sm">
                          Supports JPG, PNG, GIF (max 5MB each)
                        </p>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-3">
                          Selected Images:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border border-[#333333]">
                                <Image
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview ${index}`}
                                  width={200}
                                  height={200}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={
                            user?.image || "/placeholder.svg?height=32&width=32"
                          }
                          alt={user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-gray-300 text-sm">
                        Posting as{" "}
                        <span className="text-[#ffcc00]">
                          @{user?.username || "user"}
                        </span>
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="border-[#333333] text-gray-300 hover:bg-[#252525] hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium"
                      >
                        {isLoading ? "Creating..." : "Create Project"}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="event" className="mt-6">
                <form
                  onSubmit={eventForm.handleSubmit(onSubmitEvent)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="event-title"
                      className="text-white flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-[#ffcc00]" />
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event-title"
                      placeholder="Enter a descriptive title for your event"
                      className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                      {...eventForm.register("title")}
                    />
                    {eventForm.formState.errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {eventForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="event-description"
                      className="text-white flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-[#ffcc00]" />
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="event-description"
                      placeholder="Describe your event in detail"
                      className="bg-[#252525] border-[#333333] text-white min-h-32 focus-visible:ring-[#ffcc00]/50"
                      {...eventForm.register("description")}
                    />
                    {eventForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {eventForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="event-date"
                        className="text-white flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-[#ffcc00]" />
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="event-date"
                        type="date"
                        className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                        {...eventForm.register("date")}
                      />
                      {eventForm.formState.errors.date && (
                        <p className="text-red-500 text-sm mt-1">
                          {eventForm.formState.errors.date.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="event-time"
                        className="text-white flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-[#ffcc00]" />
                        Time
                      </Label>
                      <Input
                        id="event-time"
                        type="time"
                        className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                        {...eventForm.register("time")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="event-location"
                        className="text-white flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-[#ffcc00]" />
                        Location
                      </Label>
                      <Input
                        id="event-location"
                        placeholder="Where will the event take place?"
                        className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                        {...eventForm.register("location")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="event-organizer"
                        className="text-white flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-[#ffcc00]" />
                        Organizer
                      </Label>
                      <Input
                        id="event-organizer"
                        placeholder="Who is organizing this event?"
                        className="bg-[#252525] border-[#333333] text-white focus-visible:ring-[#ffcc00]/50"
                        {...eventForm.register("organizer")}
                      />
                    </div>
                  </div>

                  <Separator className="bg-[#333333] my-6" />

                  <div className="space-y-4">
                    <Label className="text-white flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-[#ffcc00]" />
                      Images
                    </Label>

                    <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 text-center hover:border-[#ffcc00]/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="event-images"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="event-images"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="w-10 h-10 text-gray-400" />
                        <p className="text-gray-300 font-medium">
                          Drag & drop images or{" "}
                          <span className="text-[#ffcc00]">browse</span>
                        </p>
                        <p className="text-gray-500 text-sm">
                          Supports JPG, PNG, GIF (max 5MB each)
                        </p>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-3">
                          Selected Images:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border border-[#333333]">
                                <Image
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview ${index}`}
                                  width={200}
                                  height={200}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={
                            user?.image || "/placeholder.svg?height=32&width=32"
                          }
                          alt={user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-gray-300 text-sm">
                        Posting as{" "}
                        <span className="text-[#ffcc00]">
                          @{user?.username || "user"}
                        </span>
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="border-[#333333] text-gray-300 hover:bg-[#252525] hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium"
                      >
                        {isLoading ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="border-t border-[#333333] bg-[#1a1a1a]/50 flex justify-between">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-sm"
            >
              Share your creativity with the community
            </motion.div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
