import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Poppins, Inter } from "next/font/google";
import Image from "next/image";
import NavbarLoggedIn from "@/components/nav-logged-in";

// Load font only once at the layout level
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable}`}
    >
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
            {/* Enhanced gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/85 to-black/90" />
          </div>

          <NavbarLoggedIn />

          {/* Main Content with improved spacing */}
          <main className="relative z-10 flex-grow px-4 md:px-6 py-6 md:py-8">
            {children}
          </main>

          {/* Enhanced decorative elements */}
          <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-yellow-400/3 rounded-full blur-2xl" />
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(31, 41, 55, 0.95)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.95rem",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
      </body>
    </html>
  );
}
