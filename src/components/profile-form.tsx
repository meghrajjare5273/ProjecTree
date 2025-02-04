"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { updateUser, updateUserImage } from "@/lib/updated-user";
import { currentUser } from "@/lib/get-session";
import uploadImage from "@/lib/image-uploads";
import { userSession } from "@/lib/types";

const profileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").max(20),
    name: z.string().min(2, "Name must be at least 2 characters long").max(50),
    email: z.string().email("Invalid email address"),
    bio: z.string().max(160).optional(),
    profilePicture: z.any().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [isUpdating, setIsUpdating] = useState(false);
    const [file, setFile] = useState<File | undefined>(undefined);
    const [isUser, setIsUser] = useState(false);
    const router = useRouter();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: "",
            name: "",
            email: "",
            bio: "",
            profilePicture: null,
        },
    });

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await currentUser() as userSession;
                if (user) {
                    setIsUser(true);
                    form.reset({
                        name: user.name || "",
                        email: user.email || "",
                        username: user.username || "",
                    });
                    setUserId(user.id);
                    setAvatarUrl(user.image || "");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [form]);

    async function onSubmit(data: ProfileFormValues) {
        try {
            setIsUpdating(true);

            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5MB. Please upload a smaller file.");
                    return;
                }
                const blob = await uploadImage(file);
                await updateUserImage(userId, blob);
            }

            await updateUser(userId, data);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB. Please choose a smaller file.");
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!isUser) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>You Cannot Access This Page</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push("/sign-in")}>Login Here</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={avatarUrl || "/placeholder.svg?height=96&width=96"} />
                                <AvatarFallback>{form.watch("name")?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <FormField
                                control={form.control}
                                name="profilePicture"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Profile Picture</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/*" onChange={handleFileChange} />
                                        </FormControl>
                                        <FormDescription>Choose a profile picture (max 5MB)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="johndoe" {...field} />
                                    </FormControl>
                                    <FormDescription>Public display name with letters, numbers, and dashes.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
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
                                        <Input placeholder="johndoe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us a little about yourself" {...field} />
                                    </FormControl>
                                    <FormDescription>You can @mention other users and organizations.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isUpdating}>
                            Update Profile
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
