import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SavingsCalculator from "@/components/SavingsCalculator";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SavingsCalculator />
      <HowItWorks />
      <SocialProof />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
