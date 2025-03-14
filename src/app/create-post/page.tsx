"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Define schemas for validation
const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date({ required_error: "Date is required" }),
  location: z.string().optional(),
  organizer: z.string().optional(),
});

// Define separate types for the forms
type ProjectFormData = z.infer<typeof projectSchema>;
type EventFormData = z.infer<typeof eventSchema>;

// Function to upload images to /api/upload
const uploadImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }
    const { url } = await response.json();
    return url;
  });
  return Promise.all(uploadPromises);
};

export default function CreatePost() {
  const router = useRouter();
  const [postType, setPostType] = useState<"project" | "event">("project");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create separate form instances for each type
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      location: "",
      organizer: "",
    },
  });

  // Use the appropriate form based on post type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const form = postType === "project" ? projectForm : eventForm;

  const onSubmit = async (data: ProjectFormData | EventFormData) => {
    try {
      setIsLoading(true);

      // Upload images and get URLs
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(selectedFiles);
      }

      // Prepare post data with image URLs
      const postData = { ...data, images: imageUrls };
      const endpoint = postType === "project" ? "/api/projects" : "/api/events";

      // Submit to API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast.success("Post created successfully");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("An error occurred while creating the post");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle post type change
  const handlePostTypeChange = (value: string) => {
    const newType = value as "project" | "event";
    setPostType(newType);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create a New Post</h1>

      {/* Post Type Selector */}
      <Tabs
        value={postType}
        onValueChange={handlePostTypeChange}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="event">Event</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Conditional Form Rendering */}
      {postType === "project" ? (
        <form onSubmit={projectForm.handleSubmit(onSubmit)} className="space-y-4">
          {/* Project Form Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input {...projectForm.register("title")} placeholder="Enter title" />
            {projectForm.formState.errors.title && (
              <p className="text-red-500 text-sm">
                {projectForm.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              {...projectForm.register("description")}
              placeholder="Enter description"
            />
            {projectForm.formState.errors.description && (
              <p className="text-red-500 text-sm">
                {projectForm.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <Input
              placeholder="Enter tags (comma-separated)"
              onChange={(e) =>
                projectForm.setValue(
                  "tags",
                  e.target.value.split(",").map((tag) => tag.trim())
                )
              }
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </form>
      ) : (
        <form onSubmit={eventForm.handleSubmit(onSubmit)} className="space-y-4">
          {/* Event Form Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input {...eventForm.register("title")} placeholder="Enter title" />
            {eventForm.formState.errors.title && (
              <p className="text-red-500 text-sm">
                {eventForm.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              {...eventForm.register("description")}
              placeholder="Enter description"
            />
            {eventForm.formState.errors.description && (
              <p className="text-red-500 text-sm">
                {eventForm.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input
              type="date"
              {...eventForm.register("date", {
                valueAsDate: true,
              })}
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            {eventForm.formState.errors.date && (
              <p className="text-red-500 text-sm">
                {eventForm.formState.errors.date.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              {...eventForm.register("location")}
              placeholder="Enter location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Organizer</label>
            <Input
              {...eventForm.register("organizer")}
              placeholder="Enter organizer"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      )}
    </div>
  );
}