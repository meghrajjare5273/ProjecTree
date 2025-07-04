"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { Info, Tag, FileImage, Upload, X } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import type User from "@/types/users";

// Define schema for validation
const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().optional(),
  openForCollaboration: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

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
      return data.url;
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    return []; // Return empty array instead of failing
  }
};

interface ProjectFormProps {
  user: User | null;
}

export default function ProjectForm({ user }: ProjectFormProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      openForCollaboration: false,
    },
  });

  // Watch the openForCollaboration field
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openForCollaboration = watch("openForCollaboration");

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

  const onSubmit = async (data: ProjectFormData) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
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
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
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
          {...register("tags")}
        />
        <p className="text-gray-400 text-xs">
          Tags help others discover your project
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="openForCollaboration"
            {...register("openForCollaboration")}
          />
          <Label
            htmlFor="openForCollaboration"
            className="text-white flex items-center gap-2 cursor-pointer"
          >
            Open for Collaboration
          </Label>
        </div>
        <p className="text-gray-400 text-xs pl-6">
          Let others know you&apos;re looking for collaborators on this project
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
            <h4 className="text-white font-medium mb-3">Selected Images:</h4>
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
              src={user?.image || "/placeholder.svg?height=32&width=32"}
              alt={user?.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-gray-300 text-sm">
            Posting as{" "}
            <span className="text-[#ffcc00]">@{user?.username || "user"}</span>
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
  );
}
