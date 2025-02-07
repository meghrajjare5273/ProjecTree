"use client";

import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
        .string()
        .min(8, { message: "Password should be at least 8 characters long." })
        .max(50, { message: "Password should not exceed 50 characters." }),
    name: z
        .string()
        .min(3, { message: "Name should be at least 3 characters long. " })
        .max(70, { message: "Name should not exceed 70 characters. " }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegistrationForm({
                                     className,
                                     ...props
                                 }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [isPendingGoogle, setIsPendingGoogle] = useState(false);
    const [isPendingGithub, setIsPendingGithub] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            name: "",
            password: "",
        },
    });

    useEffect(() => {
        const subscription = form.watch(() => {
            if (error) {
                setError(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, error]);

    async function onSubmit(data: RegisterFormValues) {
        setIsSubmitted(true);
        setIsPending(true);
        try {
            await authClient.signUp.email(
                {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                },
                {
                    onError: (ctx: { error: { message: string } }) => {
                        console.log(ctx);
                        form.resetField("password");
                        setError(ctx.error.message);
                    },
                    onRequest: () => {
                        console.log("Pending");
                    },
                    onSuccess: () => {
                        console.log("SUCESS!!");
                        router.push("/home");
                    },
                }
            );
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
            setIsSubmitted(false);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Create a new account to join ProjecTree
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Your Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Your Email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Set A Password"
                                        type="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPendingGithub || isSubmitted || isPendingGoogle}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please Wait...
                            </>
                        ) : (
                            "Log In"
                        )}
                    </Button>
                </form>
            </Form>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
            </div>
            <Button
                variant="outline"
                className="w-full"
                disabled={isPendingGithub || isSubmitted || isPendingGoogle}
                onClick={async () => {
                    setIsPendingGithub(true);
                    await authClient.signIn.social({
                        provider: "github",
                    });
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        fill="currentColor"
                    />
                </svg>
                {isPendingGithub ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sign Up with GitHub
                    </>
                ) : (
                    "Login with GitHub"
                )}
            </Button>
            <Button
                variant="outline"
                className="w-full"
                disabled={isPendingGithub || isSubmitted || isPendingGoogle}
                onClick={async () => {
                    setIsPendingGoogle(true);
                    await authClient.signIn.social({
                        provider: "google",
                    });
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                >
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
                    <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                {/* <Google /> */}
                {isPendingGoogle ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sign Up with Google
                    </>
                ) : (
                    "Login with Google"
                )}
            </Button>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
