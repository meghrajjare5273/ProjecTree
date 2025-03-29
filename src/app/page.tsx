// "use client"
import CommunitySpotlight from "@/components/community-spotlight";
import CTASection from "@/components/cta-section";
import FeaturesSection from "@/components/features-section";
import HeroSection from "@/components/hero";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/dashboard");
  }
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CommunitySpotlight />
      <CTASection />
    </>
  );
}
