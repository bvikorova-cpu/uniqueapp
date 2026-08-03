import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gem } from "lucide-react";
import { CrystalHero } from "@/components/crystal/CrystalHero";
import { CrystalToolCards } from "@/components/crystal/CrystalToolCards";
import { CrystalToolView } from "@/components/crystal/CrystalToolView";
import { CrystalAbout } from "@/components/crystal/CrystalAbout";
import { CrystalProgressPanel } from "@/components/crystal/CrystalProgressPanel";
import CrystalParityPack from "@/components/crystal/CrystalParityPack";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function CrystalEnergyNetwork() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    
    <>
      <FloatingHowItWorks title="Crystal & Energy Network" steps={[{ title: "Pick a tool", desc: "Choose AI Energy Reading, Energy Healing, Daily Crystal Oracle, or Aura Analysis." }, { title: "Provide input", desc: "Upload a photo or describe your energy concerns." }, { title: "AI analysis", desc: "Receive personalized crystal guidance and recommendations." }, { title: "Daily guidance", desc: "Return each day for a fresh crystal oracle card." }]} />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero */}
        <CrystalHero />

        <HeroRewardedAd sectionKey="page_crystalenergynetwork" />

        {/* Tool Cards or Tool View */}
        {selectedTool ? (
          <CrystalToolView toolName={selectedTool} onBack={() => setSelectedTool(null)} />
        ) : (
          <>
            <CrystalProgressPanel />
            <CrystalToolCards onSelectTool={setSelectedTool} />
            <CrystalAbout />

            {/* CTA */}
            <div className="text-center py-8">
              <h2 className="text-2xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Begin Your Crystal Healing Journey
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
                Discover the power of crystals with AI-powered energy analysis and personalized healing guidance
              </p>
              <Button size="lg" className="gap-2" onClick={() => setSelectedTool("AI Energy Reading")}>
                <Gem className="h-5 w-5" /> Start Your First Reading
              </Button>
              <p className="text-xs text-muted-foreground mt-3">AI-powered • Personalized results • Instant analysis</p>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
