import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, Brain, RotateCw, ArrowRightLeft, Trophy, Store,
  Gem, Palette, Sparkles, Crown
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

type ActiveView = "dashboard" | "shop" | "lucky_wheel" | "trading" | "ai_predictor" | "collection";

const TOOLS: { id: ActiveView; icon: any; label: string; desc: string; cost: string; gradient: string }[] = [
  { id: "shop", icon: Gift, label: "Mystery Box Shop", desc: "Buy & open gacha-style mystery boxes", cost: "50-2500 credits", gradient: "from-yellow-500 to-amber-600" },
  { id: "lucky_wheel", icon: RotateCw, label: "Lucky Wheel", desc: "Spin to win credits, boxes & boosts", cost: "15 credits", gradient: "from-green-500 to-emerald-600" },
  { id: "ai_predictor", icon: Brain, label: "AI Rarity Predictor", desc: "AI analyzes luck patterns & best boxes", cost: "10 credits", gradient: "from-violet-500 to-purple-600" },
  { id: "trading", icon: ArrowRightLeft, label: "Trading & Gifting", desc: "Send credits or trade items with friends", cost: "Free", gradient: "from-pink-500 to-rose-600" },
  { id: "collection", icon: Trophy, label: "My Collection", desc: "Browse your collected rewards & items", cost: "Free", gradient: "from-amber-500 to-orange-600" },
];

const MysteryBoxPage = () => {
  const { credits } = useAICredits();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const goBack = () => setActiveView("dashboard");

  const wrapView = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Navbar />
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
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <MysteryBoxHero />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border-yellow-500/20 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Gem className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-400/60 uppercase tracking-wider">Available Credits</p>
                  <p className="text-3xl font-black">{credits.credits_remaining}</p>
                </div>
                <Button size="sm" onClick={() => navigate("/ai-credits")} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold shadow-lg shadow-yellow-500/20 hover:from-yellow-600 hover:to-amber-700">Buy More</Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-yellow-500/10 hover:shadow-[0_0_20px_rgba(255,215,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Vault Features</p>
                  <p className="text-2xl font-black">5 Tools</p>
                  <p className="text-xs text-muted-foreground">Full gacha experience</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-yellow-500/10 hover:shadow-[0_0_20px_rgba(255,215,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Rarity Tiers</p>
                  <p className="text-2xl font-black">4 Levels</p>
                  <p className="text-xs text-muted-foreground">Common → Legendary</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tools Grid */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-black mb-4"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FFF8DC, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          The Vault Tools
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(tool.id)}
              className="cursor-pointer"
            >
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-yellow-500/10 hover:border-yellow-500/30 hover:shadow-[0_0_25px_rgba(255,215,0,0.1)] transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base group-hover:text-yellow-400 transition-colors">{tool.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                      {tool.cost}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6 mt-8 bg-card/60 backdrop-blur-xl border-yellow-500/10">
            <h2 className="text-xl font-black mb-3 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">What is The Vault?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The Vault is a premium gacha-style mystery box experience where luck meets strategy. 
              Purchase mystery boxes across 9 tiers — from Basic (50 credits) to Universe (2,500 credits) — 
              each offering escalating chances at rare, epic, and legendary digital collectibles.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-500/10">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span>Common</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Rare</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Epic</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Legendary</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Pro tip: Use the AI Rarity Predictor to analyze your luck patterns and find the optimal box tier for your budget!
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default MysteryBoxPage;
