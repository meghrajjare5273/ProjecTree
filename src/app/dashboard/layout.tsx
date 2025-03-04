import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Image from "next/image";
import NavbarLoggedIn from "@/components/nav-logged-in";

// Load font only once at the layout level
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your projects, events, and profile on ProjecTree",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen relative flex flex-col overflow-hidden">
          {/* Optimized Background Image with Gradient */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/pexels-enginakyurt-2943603.jpg"
              alt="Background"
              fill
              sizes="100vw"
              quality={75}
              className="object-cover"
              priority
            />
            {/* Combined gradient overlay - single layer is more efficient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90" />
          </div>

          <NavbarLoggedIn />

          {/* Main Content */}
          <main className="relative z-10 flex-grow">{children}</main>

          {/* Simplified decorative elements - reduced to one layer with two spots */}
          <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}