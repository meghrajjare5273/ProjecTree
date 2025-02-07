
import { Metadata } from "next"
//import SidebarLayout from "@/components/sidebar-layout"

export const metadata: Metadata = {
    title: "Home | ProjecTree",
    description: "Manage your projects efficiently with ProjecTree",
}

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (

        <div className="flex min-h-screen min-w-screen">
            
            <main className="flex-1 md:ml-[300px]">
                {children}
            </main>
             
        </div>

    )
}

