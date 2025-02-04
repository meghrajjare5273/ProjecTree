
import { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"

export const metadata: Metadata = {
    title: "Home | ProjecTree",
    description: "Manage your projects efficiently with ProjecTree",
}

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen min-w-screen">
            <Sidebar />
            <main className="flex-1 md:ml-[300px]">
                {children}
            </main>
        </div>

    )
}

