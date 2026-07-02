import { useState } from "react";
import { motion } from "framer-motion";
import { AstrologyHero } from "@/components/astrology/AstrologyHero";
import { AstrologyCreditsDisplay } from "@/components/astrology/AstrologyCreditsDisplay";
import { DailyMysticalRitual } from "@/components/astrology/DailyMysticalRitual";
import { MysticalProfile } from "@/components/astrology/MysticalProfile";
import { TarotReader } from "@/components/astrology/TarotReader";
import { DailyHoroscope } from "@/components/astrology/DailyHoroscope";
import { DreamInterpretation } from "@/components/astrology/DreamInterpretation";
import { NumerologyCalculator } from "@/components/astrology/NumerologyCalculator";
import { PalmistryReader } from "@/components/astrology/PalmistryReader";
import { CompatibilityChecker } from "@/components/astrology/CompatibilityChecker";
import { YesNoOracle } from "@/components/astrology/YesNoOracle";
import { RuneReader } from "@/components/astrology/RuneReader";
import { BirthChartAnalyzer } from "@/components/astrology/BirthChartAnalyzer";
import { LiveChatWithAI } from "@/components/astrology/LiveChatWithAI";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star, Moon, Sparkles, Heart, HelpCircle, Hand, Calculator, Eye,
  MessageCircle, ChevronLeft, Flame, Zap, Trophy, TrendingUp
} from "lucide-react";
import { CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ActiveView = "dashboard" | "horoscope" | "tarot" | "dream" | "numerology" | "palmistry" | "compatibility" | "yesno" | "rune" | "birthchart" | "livechat";

const TOOLS = [
  { id: "horoscope" as const, icon: Star, title: "Horoscope", desc: "Daily zodiac forecasts", cost: 1, gradient: "from-amber-500 to-yellow-400" },
  { id: "tarot" as const, icon: Sparkles, title: "Tarot Reading", desc: "AI card interpretations", cost: 3, gradient: "from-purple-500 to-violet-400" },
  { id: "dream" as const, icon: Moon, title: "Dream Analysis", desc: "Symbolic interpretation", cost: 5, gradient: "from-blue-500 to-cyan-400" },
  { id: "numerology" as const, icon: Calculator, title: "Numerology", desc: "Life path numbers", cost: 5, gradient: "from-pink-500 to-rose-400" },
  { id: "palmistry" as const, icon: Hand, title: "Palmistry", desc: "Palm line reading", cost: 10, gradient: "from-emerald-500 to-green-400" },
  { id: "compatibility" as const, icon: Heart, title: "Love Match", desc: "Zodiac compatibility", cost: 7, gradient: "from-red-500 to-pink-400" },
  { id: "yesno" as const, icon: HelpCircle, title: "Yes/No Oracle", desc: "Quick cosmic answers", cost: 2, gradient: "from-orange-500 to-amber-400" },
  { id: "rune" as const, icon: Flame, title: "Rune Reading", desc: "Norse divination", cost: 1, gradient: "from-indigo-500 to-blue-400" },
  { id: "birthchart" as const, icon: Eye, title: "Birth Chart", desc: "Full astro analysis", cost: 20, gradient: "from-violet-500 to-purple-400" },
  { id: "livechat" as const, icon: MessageCircle, title: "AI Mystic Chat", desc: "Live cosmic advisor", cost: 1, gradient: "from-cyan-500 to-teal-400" },
];

const Astrology = () => {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  usePaymentVerification();

  const renderToolView = () => {
    switch (activeView) {
      case "horoscope": return <DailyHoroscope />;
      case "tarot": return <TarotReader />;
      case "dream": return <DreamInterpretation />;
      case "numerology": return <NumerologyCalculator />;
      case "palmistry": return <PalmistryReader />;
      case "compatibility": return <CompatibilityChecker />;
      case "yesno": return <YesNoOracle />;
      case "rune": return <RuneReader />;
      case "birthchart": return <BirthChartAnalyzer />;
      case "livechat": return <LiveChatWithAI />;
      default: return null;
    }
  };

  if (activeView !== "dashboard") {
    const tool = TOOLS.find(t => t.id === activeView);
    return (
      
    <>
      <FloatingHowItWorks title="Astrology" steps={[{ title: "Set your chart", desc: "Enter birth date, time, and place." }, { title: "Read your daily", desc: "Get horoscope, ritual, and mood forecast." }, { title: "Chat with the AI", desc: "Ask relationship, career, or timing questions." }, { title: "Track patterns", desc: "Save readings and revisit your mystical profile." }]} />
      <div className="min-h-screen bg-background p-2 sm:p-4">
        <div className="container mx-auto max-w-4xl pt-16 sm:pt-20">
          <Button variant="ghost" onClick={() => setActiveView("dashboard")} className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-6">
            {tool && <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
              <tool.icon className="w-5 h-5 text-white" />
            </div>}
            <div>
              <h2 className="text-xl font-black text-foreground">{tool?.title}</h2>
              <p className="text-xs text-muted-foreground">{tool?.cost} credits per reading</p>
            </div>
          </div>
          <div className="mb-4">
            <AstrologyCreditsDisplay />
          </div>
          {renderToolView()}
        </div>
      </div>
    </>
  );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-6xl pt-16 sm:pt-20">
        <AstrologyHero />

        <HeroRewardedAd sectionKey="page_astrology" />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 mt-4">
          {/* Streak */}
          <Card className="p-4 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mystical Streak</p>
                <p className="text-2xl font-black text-foreground">7 Days</p>
                <p className="text-[10px] text-amber-500 font-medium">🔥 Keep it going!</p>
              </div>
            </div>
          </Card>

          {/* Credits */}
          <AstrologyCreditsDisplay />

          {/* Achievements */}
          <Card className="p-4 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Achievements</p>
                <p className="text-2xl font-black text-foreground">3 / 15</p>
                <p className="text-[10px] text-purple-500 font-medium">⭐ Mystic Explorer</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar + Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <DailyMysticalRitual />
            <MysticalProfile />
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-foreground">Mystical Tools</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TOOLS.map((tool, i) => (
                <motion.div key={tool.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                >
                  <Card
                    className="p-3 sm:p-4 bg-card/90 backdrop-blur-xl border-border/30 cursor-pointer hover:scale-105 hover:shadow-lg transition-all group relative overflow-hidden"
                    onClick={() => setActiveView(tool.id)}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-tight">{tool.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{tool.desc}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-primary">{tool.cost} credits</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Description Card */}
            <Card className="mt-4 p-4 bg-card/90 backdrop-blur-xl border-border/30">
              <h3 className="text-sm font-black text-foreground mb-2">🔮 About Astrology & Mystical Readings</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore the mysteries of the universe with our AI-powered mystical reading platform. 
                Get personalized insights into your life, relationships, and future through ancient wisdom 
                combined with modern artificial intelligence. All readings are generated by AI for 
                entertainment and self-reflection purposes.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Astrology;
