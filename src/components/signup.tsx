"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Define the form schema using Zod
const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores and dashes"
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const response = await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.firstName + " " + data.lastName,
          username: data.username,
          callbackURL: "/complete-profile",
        },
        {
          onRequest: () => {
            toast.loading("Please Wait.");
          },
          onSuccess: () => {
            toast.dismiss();
            toast.success("Account Created Successfully.");
            router.push("/complete-profile");
            // console.log(response)
          },
          onError: (ctx) => {
            toast.dismiss();
            toast.error(ctx.error.message);
            // console.log(error)
          },
        }
      );
      console.log("response", response);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    }
  };

  const handleGithub = async () => {
    await authClient.signIn.social({
      provider: "github",
    });
  };

  const handleGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
      onSubmit={handleSubmit(onSubmit)}
      suppressHydrationWarning
    >
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3"
        suppressHydrationWarning
      >
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-white">
            First name
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            className={`bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 ${
              errors.firstName ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-white">
            Last name
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            className={`bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 ${
              errors.lastName ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="username" className="text-white">
          Username
        </Label>
        <Input
          id="username"
          placeholder="johndoe"
          className={`bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 ${
            errors.username ? "border-red-500 focus:ring-red-500" : ""
          }`}
          {...register("username")}
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          placeholder="projectree@example.com"
          type="email"
          className={`bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 ${
            errors.email ? "border-red-500 focus:ring-red-500" : ""
          }`}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          className={`bg-gray-800/50 border-gray-700 text-white h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 ${
            errors.password ? "border-red-500 focus:ring-red-500" : ""
          }`}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2">
        <Button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold h-11 transition-all duration-200 transform hover:scale-[1.02]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-4 text-gray-400">Or sign up with</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 h-11 transition-all duration-200 transform hover:scale-[1.02]"
          onClick={handleGithub}
        >
          <Github className="mr-2 h-4 w-4 text-gray-300" />
          Github
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 h-11 transition-all duration-200 transform hover:scale-[1.02]"
          onClick={handleGoogle}
        >
          <Mail className="mr-2 h-4 w-4 text-gray-300" />
          Google
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="text-xs text-gray-400 text-center"
      >
        By signing up, you agree to our{" "}
        <Link
          href="/terms"
          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
        >
          Privacy Policy
        </Link>
      </motion.div>
    </motion.form>
  );
}