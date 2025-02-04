import { SquareDashedKanban } from 'lucide-react'
import { RegistrationForm } from "@/components/register-form"
import Image from "next/image"
import Link from 'next/link'
import { ModeToggle } from '@/components/theme-button'

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="relative hidden bg-muted lg:block">
                <Image
                    src="/ai-generated-9295105.jpg"
                    alt="Decorative background image"
                    layout="fill"
                    objectFit="cover"
                    className="dark:brightness-[0.2] dark:grayscale"
                />
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-end">
                    <Link href="/" className="flex items-center gap-2 font-medium text-bold">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <SquareDashedKanban className="size-8" />
                        </div>
                        ProjecTree Inc.
                    </Link>
                </div>
                <div className="absolute"><ModeToggle /> </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <RegistrationForm />
                    </div>
                </div>
            </div>
        </div>
    )
}


