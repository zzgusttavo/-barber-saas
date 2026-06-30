import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-white">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
