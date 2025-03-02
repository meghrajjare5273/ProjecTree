"use client"

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Define the validation schema
const signInSchema = z.object({
  identifier: z.string()
    .min(1, "Email or username is required")
    .refine((value) => {
      // Check if value is email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if value is username (3-20 chars, alphanumeric and underscore)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return emailRegex.test(value) || usernameRegex.test(value);
    }, "Please enter a valid email or username"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
});

type SignInSchema = z.infer<typeof signInSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function SignIn() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema)
  });

  const onSubmit = async (data: SignInSchema) => {
    try {
      // Here you can add your sign-in logic
      // Example:
      // const isEmail = data.identifier.includes('@');
      // const credentials = {
      //   type: isEmail ? 'email' : 'username',
      //   identifier: data.identifier,
      //   password: data.password
      // };
      // await authClient.signIn.credentials(credentials);
      const isEmail = data.identifier.includes("@")
      // console.log(isEmail)
      if(isEmail){
        await authClient.signIn.email({
          email: data.identifier,
          password: data.password,
          callbackURL: "/dashboard"
        },{
          onRequest: () => {
            toast.loading("Please Wait.")
          },
          onSuccess : () => {
            toast.dismiss()
            toast.success("Logged In Successfully.")
            // console.log(response)
          },
          onError: (ctx) => {
            toast.dismiss()
            toast.error(ctx.error.message)
            // console.log(error)
          }
        })
      }else if(!isEmail){
        await authClient.signIn.username({
          username: data.identifier,
          password: data.password,
          // callbackURL: "/dashboard"
        },{
          onRequest: () => {
            toast.loading("Please Wait.")
          },
          onSuccess : () => {
            toast.dismiss()
            toast.success("Logged In Successfully.")
            router.push("/dashboard")
            // console.log(response)
          },
          onError: (ctx) => {
            toast.dismiss()
            toast.error(ctx.error.message)
            // console.log(error)
          }
        })
      }

    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleGithub = async () => {
    await authClient.signIn.social({
      provider: "github"
    });
  };

  const handleGoogle = async () => {
    await authClient.signIn.social({
      provider: "google"
    });
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
          <Label htmlFor="identifier" className="text-white">Email or Username</Label>
          <Input
            id="identifier"
            placeholder="Enter your email or username"
            {...register("identifier")}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
          />
          {errors.identifier && (
            <span className="text-red-400 text-sm">
              {errors.identifier.message}
            </span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white">Password</Label>
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
          >
            Sign In
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-4 text-gray-400">Or continue with</span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3"
        >
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
      </motion.div>
    </form>
  );
}