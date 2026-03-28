import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SocialProof from "@/components/landing/SocialProof";
import ForWhoSection from "@/components/landing/ForWhoSection";
import GallerySection from "@/components/landing/GallerySection";
import DifferentialsSection from "@/components/landing/DifferentialsSection";
import CalculatorSection from "@/components/landing/CalculatorSection";
import PlansSection from "@/components/landing/PlansSection";
import FAQSection from "@/components/landing/FAQSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  const handlePlanClick = (planName: string) => {
    console.log(`Plan clicked: ${planName}`);
    // Tracking will be added when Supabase is connected
  };

  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <Navbar />
      <div id="inicio">
        <HeroSection />
      </div>
      <SocialProof />
      <ForWhoSection />
      <GallerySection />
      <DifferentialsSection />
      <CalculatorSection />
      <PlansSection onPlanClick={handlePlanClick} />
      <FAQSection />
      <div id="contato">
        <FooterSection />
      </div>
    </main>
  );
};

export default Index;
