import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, Brain, RotateCw, ArrowRightLeft, Trophy, 
  Gem, Sparkles, Crown, Flame, Shield, Zap, Star
} from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MysteryBoxHero } from "@/components/mystery-box/MysteryBoxHero";
import { MysteryBoxShop } from "@/components/mystery-box/MysteryBoxShop";
import { LuckyWheel } from "@/components/mystery-box/LuckyWheel";
import { MysteryBoxTrading } from "@/components/mystery-box/MysteryBoxTrading";
import { AIRarityPredictor } from "@/components/mystery-box/AIRarityPredictor";
import { MysteryBoxRewards } from "@/components/mystery-box/MysteryBoxRewards";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ActiveView = "dashboard" | "shop" | "lucky_wheel" | "trading" | "ai_predictor" | "collection";

const TOOLS: { id: ActiveView; icon: any; label: string; desc: string; cost: string; gradient: string; glow: string }[] = [
  { id: "shop", icon: Gift, label: "Mystery Box Shop", desc: "Buy & open gacha-style mystery boxes across 9 tiers", cost: "50-2500 credits", gradient: "from-yellow-500 to-amber-600", glow: "shadow-yellow-500/20" },
  { id: "lucky_wheel", icon: RotateCw, label: "Lucky Wheel", desc: "Spin to win credits, free boxes & luck boosts", cost: "15 credits", gradient: "from-green-500 to-emerald-600", glow: "shadow-green-500/20" },
  { id: "ai_predictor", icon: Brain, label: "AI Rarity Predictor", desc: "AI analyzes your luck patterns & suggests best boxes", cost: "8-10 credits", gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
  { id: "trading", icon: ArrowRightLeft, label: "Trading & Gifting", desc: "Send credits or trade items with friends securely", cost: "Free", gradient: "from-pink-500 to-rose-600", glow: "shadow-pink-500/20" },
  { id: "collection", icon: Trophy, label: "My Collection", desc: "Browse and filter your collected rewards & items", cost: "Free", gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
];

const MysteryBoxPage = () => {
  const { credits } = useAICredits();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const goBack = () => setActiveView("dashboard");

  const wrapView = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 mt-20">{children}</main>
    </div>
  );

  if (activeView === "shop") return wrapView(<MysteryBoxShop onBack={goBack} />);
  if (activeView === "lucky_wheel") return wrapView(<LuckyWheel onBack={goBack} />);
  if (activeView === "trading") return wrapView(<MysteryBoxTrading onBack={goBack} />);
  if (activeView === "ai_predictor") return wrapView(<AIRarityPredictor onBack={goBack} />);
  if (activeView === "collection") return wrapView(<MysteryBoxRewards onBack={goBack} />);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 mt-20">
        <MysteryBoxHero />

        <HeroRewardedAd sectionKey="page_mysterybox" />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border-yellow-500/20 hover:shadow-[0_0_25px_rgba(255,215,0,0.12)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <Gem className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-yellow-400/60 uppercase tracking-wider font-semibold">Available Credits</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{credits.credits_remaining}</p>
                </div>
                <Button size="sm" onClick={() => navigate("/ai-credits")} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold shadow-lg shadow-yellow-500/25 hover:from-yellow-600 hover:to-amber-700 active:scale-[0.95]">
                  Buy More
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 bg-card/90 backdrop-blur-xl border-yellow-500/10 hover:shadow-[0_0_20px_rgba(255,215,0,0.08)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Vault Features</p>
                  <p className="text-2xl font-black">5 Tools</p>
                  <p className="text-[10px] text-muted-foreground">Full gacha experience</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5 bg-card/90 backdrop-blur-xl border-yellow-500/10 hover:shadow-[0_0_20px_rgba(255,215,0,0.08)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rarity Tiers</p>
                  <p className="text-2xl font-black">4 Levels</p>
                  <p className="text-[10px] text-muted-foreground">Common → Legendary</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-5"
        >
          <Flame className="h-5 w-5 text-yellow-400" />
          <h2
            className="text-2xl font-black"
            style={{
              background: "linear-gradient(135deg, #FFD700, #FFF8DC, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Vault Tools
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 250 }}
              whileHover={{ scale: 1.04, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(tool.id)}
              className="cursor-pointer"
            >
              <Card className="p-5 bg-card/90 backdrop-blur-xl border-yellow-500/10 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] transition-all group relative overflow-hidden">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-yellow-500/5 to-transparent" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg ${tool.glow} group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base group-hover:text-yellow-400 transition-colors">{tool.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                      {tool.cost}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tips & Info Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6 mt-8 bg-card/80 backdrop-blur-xl border-yellow-500/10">
            <h2 className="text-xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">What is The Vault?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Vault is a premium gacha-style mystery box experience where luck meets strategy. 
              Purchase mystery boxes across 9 tiers — from Basic (50 credits) to Universe (2,500 credits) — 
              each offering escalating chances at rare, epic, and legendary digital collectibles.
            </p>

            {/* Rarity tiers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-5">
              {[
                { label: "Common", color: "bg-slate-500", bg: "bg-slate-500/10" },
                { label: "Rare", color: "bg-blue-500", bg: "bg-blue-500/10" },
                { label: "Epic", color: "bg-purple-500", bg: "bg-purple-500/10" },
                { label: "Legendary", color: "bg-yellow-500", bg: "bg-yellow-500/10" },
              ].map(r => (
                <div key={r.label} className={`flex items-center gap-2 p-2.5 rounded-lg ${r.bg}`}>
                  <div className={`w-3 h-3 rounded-full ${r.color}`} />
                  <span className="font-semibold">{r.label}</span>
                </div>
              ))}
            </div>

            {/* Pro tips */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-yellow-400 flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Pro Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { icon: Brain, tip: "Use the AI Rarity Predictor to analyze your luck patterns before buying." },
                  { icon: RotateCw, tip: "Spin the Lucky Wheel daily — even small wins add up over time." },
                  { icon: Star, tip: "Higher-tier boxes have exponentially better legendary drop rates." },
                  { icon: Shield, tip: "Gift credits to friends — they can gift back items you need." },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card/50 border border-border/30 text-xs text-muted-foreground">
                    <t.icon className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{t.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default MysteryBoxPage;
