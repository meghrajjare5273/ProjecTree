"use client"
import ProfileForm from "@/components/profile-form"

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-100 to-gray-200">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
                <ProfileForm />
            </div>
        </div>
    )
}

