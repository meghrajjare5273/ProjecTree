import { ReactNode } from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Domine } from 'next/font/google';

const anton = Domine({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Authentication | ProjecTree",
    description: "Sign up, sign in, and manage your account",
};

interface AuthLayoutProps {
    children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
    const user = await auth.api.getSession({
        headers: await headers(),
    });
    if (user) {
        return redirect("/home");
    }
    return (
        <main className={anton.className}>{children}</main>
    );
}
