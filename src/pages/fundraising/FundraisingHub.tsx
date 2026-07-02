import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Wand2 } from "lucide-react";
import { FundraisingHero } from "@/components/fundraising/FundraisingHero";
import { LiveImpactTicker } from "@/components/fundraising/LiveImpactTicker";
import { FeaturedCampaignSpotlight } from "@/components/fundraising/FeaturedCampaignSpotlight";
import { FundraisingCategoryCards } from "@/components/fundraising/FundraisingCategoryCards";
import { LiveDonationFeed } from "@/components/fundraising/LiveDonationFeed";
import { QuickDonateWidget } from "@/components/fundraising/QuickDonateWidget";
import { ImpactCalculator } from "@/components/fundraising/ImpactCalculator";
import { DonorLeaderboard } from "@/components/fundraising/DonorLeaderboard";
import { TrustSection } from "@/components/fundraising/TrustSection";
import { AIStoryGenerator } from "@/components/fundraising/AIStoryGenerator";
import { NewCampaignPicker } from "@/components/fundraising/NewCampaignPicker";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function FundraisingHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-20">
      <FloatingHowItWorks
        title="Fundraising Hub"
        intro="Central place to browse all 7 fundraising categories."
        steps={[
          { title: "Pick a category", desc: "Choose Medical, Dream, Hero, Pet, Student, Crisis or Talent." },
          { title: "Browse verified campaigns", desc: "Only campaigns that passed verification are shown." },
          { title: "Donate securely", desc: "Payments are handled by Stripe with instant receipts." },
          { title: "Track your impact", desc: "See donor dashboard for history, tax receipts and recurring gifts." },
          { title: "Start your own", desc: "Every category has a Create button for new campaigns." }
        ]}
      />
      <div className="max-w-7xl mx-auto px-4">
        <FundraisingHero
          onMyCampaigns={() => navigate("/fundraising/dashboard")}
          onExplore={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
        />
      </div>

      <LiveImpactTicker />

      <FeaturedCampaignSpotlight />

      <div id="categories">
        <FundraisingCategoryCards />
      </div>

      <LiveDonationFeed />

      <QuickDonateWidget />

      <ImpactCalculator />

      <DonorLeaderboard />

      {/* AI Story Writer banner */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 p-8 text-center overflow-hidden shadow-[0_0_50px_-20px_rgba(251,191,36,0.4)]">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 mb-3 shadow-lg">
                <Wand2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                  AI Story Writer
                </span>
              </h2>
              <p className="text-muted-foreground mb-5 max-w-md mx-auto text-sm">
                Don't know where to start? Describe your situation in 2 sentences — AI writes a powerful, donor-ready story.
              </p>
              <AIStoryGenerator
                campaignType="medical"
                trigger={
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold border-0">
                    <Wand2 className="mr-2 h-4 w-4" /> Try AI Story Writer
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">5 credits</span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </section>

      <TrustSection />

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4 drop-shadow">Ready to Make a Difference?</h2>
          <p className="text-lg text-white/90 mb-6 drop-shadow">
            Create your campaign today and get support from the community
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <NewCampaignPicker triggerLabel="Create Campaign" variant="outline" />
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}>
              <Heart className="mr-2 h-4 w-4" /> Browse All Campaigns
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
