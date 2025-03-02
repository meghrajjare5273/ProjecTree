/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  GitHub,
  LinkedIn,
  Person,
  Description,
  AddAPhoto,
} from "@mui/icons-material";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and dashes"
    ),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  profileImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Styled Components with MUI
const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "10px",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "#facc15",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#facc15",
      boxShadow: "0 0 8px rgba(250, 204, 21, 0.5)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-focused": {
      color: "#facc15",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#ff6b6b",
  },
});

const StyledFileInput = styled("input")({
  display: "none",
});

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } },
};

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

// Loading Animation Component
const LoadingAnimation = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <CircularProgress size={60} sx={{ color: "#facc15" }} />
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
);

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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
      console.log(user);
      if (user) {
        setValue("username", user.username || "");
        setValue("bio", user.bio || "");
        setValue("github", user.socialLinks?.github || "");
        setValue("linkedin", user.socialLinks?.linkedin || "");
        setValue("profileImage", user.image || "");
        if (user.image) setImagePreview(user.image);
      }
      setLoading(false);
    };
    checkSession();
  }, [router, setValue]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { url } = await response.json();
      setValue("profileImage", url);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const socialLinks = {
        github: data.github || null,
        linkedin: data.linkedin || null,
      };

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          bio: data.bio || null,
          socialLinks,
          profileImage: data.profileImage || null,
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
        <LoadingAnimation />
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
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
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-stretch bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Left Panel - Welcome Section */}
        <div className="lg:w-5/12 p-8 lg:p-12 relative overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <Typography
              variant="h3"
              className="text-white font-bold mb-4"
              sx={{ fontSize: { xs: "2rem", lg: "2.5rem" } }}
            >
              Welcome To <b>Projec</b>
              <b className="text-yellow-400">Tree</b>
            </Typography>
            <br></br>
            <br></br>
            <Typography
              variant="body1"
              className="text-gray-300 mb-8"
              sx={{ fontSize: { xs: "1rem", lg: "1.125rem" } }}
            >
              Complete your profile to unlock the full ProjecTree experience.
            </Typography>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
        </div>

        {/* Right Panel - Form Section */}
        <div className="lg:w-7/12 p-8 lg:p-12 bg-gray-900/50">
          <AnimatePresence mode="wait">
            <motion.div
              key="profile-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box display="flex" flexDirection="column" gap={4}>
                  {/* Profile Image */}
                  <Box textAlign="center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Avatar
                        src={imagePreview || ""}
                        sx={{
                          width: { xs: 100, lg: 120 },
                          height: { xs: 100, lg: 120 },
                          mb: 2,
                          border: "2px solid #facc15",
                        }}
                      />
                      <label htmlFor="profile-image">
                        <StyledFileInput
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={
                            imageUploading ? (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#facc15" }}
                              />
                            ) : (
                              <AddAPhoto />
                            )
                          }
                          disabled={imageUploading}
                          className={`px-6 py-2 rounded-full transition-all duration-300 ${
                            imageUploading
                              ? "text-gray-400"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          {imageUploading ? "Uploading..." : "Upload Photo"}
                        </Button>
                      </label>
                      {errors.profileImage && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ mt: 1 }}
                        >
                          {errors.profileImage.message}
                        </Typography>
                      )}
                      {imageUploading && (
                        <LinearProgress
                          sx={{
                            mt: 1,
                            bgcolor: "rgba(250, 204, 21, 0.2)",
                            "& .MuiLinearProgress-bar": { bgcolor: "#facc15" },
                          }}
                        />
                      )}
                    </motion.div>
                  </Box>

                  {/* Form Fields */}
                  <StyledTextField
                    fullWidth
                    label="Username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    {...register("username")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "rgba(255,255,255,0.7)" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Bio"
                    error={!!errors.bio}
                    helperText={errors.bio?.message}
                    {...register("bio")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Description
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="GitHub URL"
                    error={!!errors.github}
                    helperText={errors.github?.message}
                    {...register("github")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GitHub sx={{ color: "rgba(255,255,255,0.7)" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="LinkedIn URL"
                    error={!!errors.linkedin}
                    helperText={errors.linkedin?.message}
                    {...register("linkedin")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkedIn sx={{ color: "rgba(255,255,255,0.7)" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting || imageUploading}
                      fullWidth
                      className={`px-6 py-2 rounded-full transition-all duration-300 ${
                        isSubmitting || imageUploading
                          ? "bg-yellow-400/50 text-gray-600"
                          : "bg-yellow-400 text-black hover:bg-yellow-300"
                      } font-semibold`}
                    >
                      {isSubmitting ? (
                        <Box display="flex" alignItems="center" gap={2}>
                          <CircularProgress
                            size={16}
                            sx={{ color: "#1e1e1e" }}
                          />
                          Saving...
                        </Box>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </motion.div>
                </Box>
              </form>
            </motion.div>
          </AnimatePresence>
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