import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { FundraisingHero } from "@/components/fundraising/FundraisingHero";
import { LiveImpactTicker } from "@/components/fundraising/LiveImpactTicker";
import { FeaturedCampaignSpotlight } from "@/components/fundraising/FeaturedCampaignSpotlight";
import { FundraisingCategoryCards } from "@/components/fundraising/FundraisingCategoryCards";
import { QuickDonateWidget } from "@/components/fundraising/QuickDonateWidget";
import { ImpactCalculator } from "@/components/fundraising/ImpactCalculator";
import { DonorLeaderboard } from "@/components/fundraising/DonorLeaderboard";
import { TrustSection } from "@/components/fundraising/TrustSection";

export default function FundraisingHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <FundraisingHero
        onMyCampaigns={() => navigate("/fundraising/dashboard")}
        onExplore={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* Live ticker */}
      <LiveImpactTicker />

      {/* Featured campaign */}
      <FeaturedCampaignSpotlight />

      {/* Categories */}
      <div id="categories">
        <FundraisingCategoryCards />
      </div>

      {/* Quick Donate */}
      <QuickDonateWidget />

      {/* Impact Calculator */}
      <ImpactCalculator />

      {/* Donor Leaderboard */}
      <DonorLeaderboard />

      {/* Trust Section */}
      <TrustSection />

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-white/90 mb-6">
            Create your campaign today and get support from the community
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" variant="secondary" onClick={() => navigate("/fundraising/medical/create")}>
              <Sparkles className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              <Heart className="mr-2 h-4 w-4" /> Browse All Campaigns
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
