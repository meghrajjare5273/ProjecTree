"use client";

import SidebarLayout from "@/components/sidebar-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { currentUser } from "@/lib/get-session";
import { userSession } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Homepage() {
    const [user, setUser] = useState<userSession | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        async function fetchUser() {
            const user = await currentUser();
            if (user) {
                setUser(user as userSession);
                setIsLoading(false);
            }
        }
        fetchUser();
    }, []);

    return(
        <SidebarLayout>
        <div className="p-4">
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[300px]" />
                    <Skeleton className="h-4 w-[250px]" />
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-4">Welcome {user?.name}</h1>
                    {/* Add more content here */}
                </>
            )}
        </div>
        </SidebarLayout> 
    )
}
