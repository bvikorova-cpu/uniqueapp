import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Gem } from "lucide-react";
import { CrystalHero } from "@/components/crystal/CrystalHero";
import { CrystalEngagementRow } from "@/components/crystal/CrystalEngagementRow";
import { CrystalToolCards } from "@/components/crystal/CrystalToolCards";
import { CrystalToolView } from "@/components/crystal/CrystalToolView";
import { CrystalAbout } from "@/components/crystal/CrystalAbout";
import CrystalParityPack from "@/components/crystal/CrystalParityPack";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
export default function CrystalEnergyNetwork() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");
    if (success === "true" && sessionId) {
      supabase.functions.invoke("verify-crystal-payment", {
        body: { sessionId },
      }).then(({ error }) => {
        if (error) {
          toast({ title: "Verification failed", description: "Please contact support.", variant: "destructive" });
        } else {
          toast({ title: "Payment successful!", description: "Your service has been activated." });
        }
      });
      window.history.replaceState({}, "", "/crystal-energy-network");
    } else if (searchParams.get("canceled") === "true") {
      toast({ title: "Payment canceled", description: "No charges were made." });
      window.history.replaceState({}, "", "/crystal-energy-network");
    }
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero */}
        <CrystalHero />

        <HeroRewardedAd sectionKey="page_crystalenergynetwork" />

        {/* Engagement Row */}
        <CrystalEngagementRow />

        {/* AI Parity Pack */}
        <CrystalParityPack />

        {/* Tool Cards or Tool View */}
        {selectedTool ? (
          <CrystalToolView toolName={selectedTool} onBack={() => setSelectedTool(null)} />
        ) : (
          <>
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
  );
}
