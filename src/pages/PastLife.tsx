import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Sparkles, Heart, History, CreditCard, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { PastLifeHero } from "@/components/past-life/PastLifeHero";
import { PastLifeStreak } from "@/components/past-life/PastLifeStreak";
import { PastLifeProgressPreview } from "@/components/past-life/PastLifeProgressPreview";
import { PastLifeAchievements } from "@/components/past-life/PastLifeAchievements";
import { PastLifeToolCard } from "@/components/past-life/PastLifeToolCard";
import { PastLifeTestimonials } from "@/components/past-life/PastLifeTestimonials";
import { PastLifeComparisonTable } from "@/components/past-life/PastLifeComparisonTable";
import { PastLifeForm } from "@/components/past-life/PastLifeForm";
import { PastLifeResult } from "@/components/past-life/PastLifeResult";
import { PastLifeHistory } from "@/components/past-life/PastLifeHistory";
import { PastLifeCreditsDisplay } from "@/components/past-life/PastLifeCreditsDisplay";
import { PastLifeEraWheel } from "@/components/past-life/PastLifeEraWheel";
import { PastLifeDailyVision } from "@/components/past-life/PastLifeDailyVision";
import { PastLifeIdeasShowcase } from "@/components/past-life/PastLifeIdeasShowcase";
import { PastLifeEraQuiz } from "@/components/past-life/PastLifeEraQuiz";
import { PastLifeParityPack } from "@/components/past-life/PastLifeParityPack";
import { usePastLifeCredits } from "@/hooks/usePastLifeCredits";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "basic" | "full" | "soulmate" | "history" | "credits";

const PAST_LIFE_TOOLS = [
  {
    id: "basic",
    title: "Basic Reading",
    description: "Discover a single past life with detailed karmic lessons",
    icon: Clock,
    credits: 5,
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    features: ["1 detailed past life story", "Historical period & location", "Profession & life events", "Karmic lesson"],
  },
  {
    id: "full",
    title: "Full Reading",
    description: "Deep dive into 3 past lives with AI illustrations",
    icon: Sparkles,
    credits: 15,
    gradient: "bg-gradient-to-r from-primary to-accent",
    features: ["3 complete past life stories", "AI-generated illustrations", "Overall karmic theme", "Soul evolution analysis"],
  },
  {
    id: "soulmate",
    title: "Soul Mate Connection",
    description: "Discover past life connections with your partner",
    icon: Heart,
    credits: 20,
    gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    features: ["Your 3 past lives + illustrations", "Partner's past life analysis", "Shared past life connections", "Relationship karmic patterns"],
  },
];

const PastLife = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [currentReading, setCurrentReading] = useState<any>(null);
  const { analyzePastLife, isAnalyzing } = usePastLifeCredits();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const credits = searchParams.get("credits");
    if (payment === "success" && credits) {
      toast.success(`Payment successful! ${credits} credits added to your account.`);
      setSearchParams({});
    } else if (payment === "cancelled") {
      toast.error("Payment cancelled");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleAnalysisComplete = (result: any) => {
    setCurrentReading(result.reading);
    toast.success("Your past lives have been revealed!");
  };

  const handleSubmit = (data: any) => {
    analyzePastLife(data, { onSuccess: handleAnalysisComplete });
  };

  const openTool = (toolId: string) => {
    setActiveView(toolId as ViewType);
    setCurrentReading(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
        <AnimatePresence mode="wait">
          {activeView === "hub" ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <PastLifeHero />

              <HeroRewardedAd sectionKey="page_pastlife" />

              {/* Engagement Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PastLifeStreak />
                <PastLifeProgressPreview />
                <PastLifeAchievements />
              </div>

              {/* Era Compass + Daily Vision + Quiz */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <PastLifeEraWheel />
                </div>
                <div className="space-y-4">
                  <PastLifeDailyVision />
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tools */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      Reading Types
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveView("history")}
                        className="text-xs gap-1.5"
                      >
                        <History className="h-3.5 w-3.5" />
                        History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveView("credits")}
                        className="text-xs gap-1.5"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Credits
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PAST_LIFE_TOOLS.map((tool, i) => (
                      <PastLifeToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={() => openTool(tool.id)}
                        index={i}
                      />
                    ))}
                  </div>

                  {/* How It Works */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {[
                      { step: "1", title: "Enter Details", desc: "Provide your birth date and personal experiences" },
                      { step: "2", title: "AI Analysis", desc: "Our AI channels mystical wisdom to reveal your past" },
                      { step: "3", title: "Discover", desc: "Explore detailed stories of your previous incarnations" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-start gap-3 p-4 rounded-xl bg-card/60 backdrop-blur border border-border/30">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {s.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{s.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expansion Pack */}
                  <PastLifeParityPack />

                  {/* Tips & Future Features */}
                  <PastLifeIdeasShowcase />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <PastLifeEraQuiz />
                  <PastLifeComparisonTable />
                  <PastLifeTestimonials />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setActiveView("hub"); setCurrentReading(null); }}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hub
              </Button>

              {(activeView === "basic" || activeView === "full" || activeView === "soulmate") && (
                <div className="space-y-6">
                  <PastLifeForm
                    onSubmit={handleSubmit}
                    isAnalyzing={isAnalyzing}
                    defaultReadingType={activeView}
                  />
                  {currentReading && <PastLifeResult reading={currentReading} />}
                </div>
              )}

              {activeView === "history" && <PastLifeHistory />}
              {activeView === "credits" && <PastLifeCreditsDisplay />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PastLife;
