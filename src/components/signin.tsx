"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the validation schema
const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .refine((value) => {
      // Check if value is email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if value is username (3-20 chars, alphanumeric and underscore)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return emailRegex.test(value) || usernameRegex.test(value);
    }, "Please enter a valid email or username"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SignInSchema = z.infer<typeof signInSchema>;

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

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState({
    form: false,
    github: false,
    google: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInSchema) => {
    try {
      setIsLoading((prev) => ({ ...prev, form: true }));
      const isEmail = data.identifier.includes("@");

      if (isEmail) {
        await authClient.signIn.email(
          {
            email: data.identifier,
            password: data.password,
            callbackURL: "/dashboard",
          },
          {
            onRequest: () => {
              toast.loading("Signing you in...");
            },
            onSuccess: () => {
              toast.dismiss();
              toast.success("Logged in successfully!");
              router.push("/dashboard");
            },
            onError: (ctx) => {
              toast.dismiss();
              toast.error(ctx.error.message);
            },
          }
        );
      } else {
        await authClient.signIn.username(
          {
            username: data.identifier,
            password: data.password,
          },
          {
            onRequest: () => {
              toast.loading("Signing you in...");
            },
            onSuccess: () => {
              toast.dismiss();
              toast.success("Logged in successfully!");
              router.push("/dashboard");
            },
            onError: (ctx) => {
              toast.dismiss();
              toast.error(ctx.error.message);
            },
          }
        );
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleGithub = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, github: true }));
      await authClient.signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.error("GitHub sign in failed:", error);
      toast.error("GitHub authentication failed. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, github: false }));
    }
  };

  const handleGoogle = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, google: true }));
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error("Google sign in failed:", error);
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, google: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="identifier" className="text-white">
            Email or Username
          </Label>
          <Input
            id="identifier"
            placeholder="Enter your email or username"
            {...register("identifier")}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
            disabled={isLoading.form}
          />
          {errors.identifier && (
            <span className="text-red-400 text-sm">
              {errors.identifier.message}
            </span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Link
              href="/auth/reset-password"
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className="bg-gray-800/50 border-gray-700 text-white h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
            disabled={isLoading.form}
          />
          {errors.password && (
            <span className="text-red-400 text-sm">
              {errors.password.message}
            </span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <Button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold h-11 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading.form || isLoading.github || isLoading.google}
          >
            {isLoading.form ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-4 text-gray-400 bg-gray-900/50 backdrop-blur-md">
              Or continue with
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 h-11 transition-all duration-200 transform hover:scale-[1.02]"
            onClick={handleGithub}
            disabled={isLoading.form || isLoading.github || isLoading.google}
          >
            {isLoading.github ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <div className="bg-white rounded-full p-0.5 mr-2">
                <Github className="h-4 w-4 text-black" />
              </div>
            )}
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 h-11 transition-all duration-200 transform hover:scale-[1.02]"
            onClick={handleGoogle}
            disabled={isLoading.form || isLoading.github || isLoading.google}
          >
            {isLoading.google ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <div className="bg-white rounded-full p-0.5 mr-2 flex items-center justify-center">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
            )}
            Google
          </Button>
        </motion.div>
      </motion.div>
    </form>
  );
}
