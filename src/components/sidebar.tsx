"use client"

import { Bell, Home, MessageSquare, Search, User } from 'lucide-react'
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//import { ScrollArea } from "@/components/ui/scroll-area"

export function Sidebar() {
    return (
        <div className="hidden md:flex">
            <div className="fixed inset-y-0 left-0 w-[300px] flex-col bg-white shadow-sm">
                <div className="flex h-16 items-center border-b px-6">
                    <div className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250117_200525-SEV6qpOTbHJWH9F716xcWtHGKu01r5.png" alt="User" />
                            <AvatarFallback>PT</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">ProjectTree Inc.</span>
                            <span className="text-xs text-muted-foreground">Admin</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-1 p-2">
                    <div className="px-4 py-2">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search" className="pl-8" />
                            </div>
                        </form>
                    </div>
                    <nav className="space-y-1 px-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            asChild
                        >
                            <Link href="/dashboard">
                                <Home className="h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            asChild
                        >
                            <Link href="/notifications">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            asChild
                        >
                            <Link href="/messages">
                                <MessageSquare className="h-4 w-4" />
                                Messages
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            asChild
                        >
                            <Link href="/profile">
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    )
}

