import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, TrendingUp, Shield, Zap, Wallet, Users,
  RotateCw, Trophy, MessageSquare, BarChart3
} from "lucide-react";
import { EmotionEconomyHero } from "@/components/emotion-economy/EmotionEconomyHero";
import { EmotionEconomyEngagement } from "@/components/emotion-economy/EmotionEconomyEngagement";
import { EmotionEconomyToolCard } from "@/components/emotion-economy/EmotionEconomyToolCard";
import { EmotionWallet } from "@/components/emotion-economy/EmotionWallet";
import { EmotionFeed } from "@/components/emotion-economy/EmotionFeed";
import { EmotionMarket } from "@/components/emotion-economy/EmotionMarket";
import { EmotionMining } from "@/components/emotion-economy/EmotionMining";
import { EmotionInsurance } from "@/components/emotion-economy/EmotionInsurance";
import { EmotionDrops } from "@/components/emotion-economy/EmotionDrops";
import { EmotionRoulette } from "@/components/emotion-economy/EmotionRoulette";
import { EmotionLeaderboard } from "@/components/emotion-economy/EmotionLeaderboard";
import { AIMoodTherapist } from "@/components/emotion-economy/AIMoodTherapist";
import { EmotionFutures } from "@/components/emotion-economy/EmotionFutures";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "feed" | "wallet" | "market" | "mining" | "insurance" | "drops" | "roulette" | "leaderboard" | "therapist" | "futures";

const tools = [
  { id: "feed" as ViewType, icon: Users, title: "Emotion Feed", description: "Share feelings, AI detects emotions", badge: "AI", credits: 1, gradient: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-400" },
  { id: "wallet" as ViewType, icon: Wallet, title: "Emotion Wallet", description: "Track your emotional portfolio", gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-400" },
  { id: "market" as ViewType, icon: TrendingUp, title: "Emotion Market", description: "Buy and sell emotions", gradient: "from-cyan-500/10 to-cyan-500/5", iconColor: "text-cyan-400" },
  { id: "mining" as ViewType, icon: Zap, title: "Emotion Mining", description: "Create content, earn 50% commission", gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "therapist" as ViewType, icon: MessageSquare, title: "AI Mood Therapist", description: "AI-powered portfolio advice", badge: "AI", credits: 3, gradient: "from-cyan-500/10 to-violet-500/5", iconColor: "text-cyan-400" },
  { id: "roulette" as ViewType, icon: RotateCw, title: "Emotion Roulette", description: "Spin the wheel, win 2x!", badge: "Game", credits: 1, gradient: "from-pink-500/10 to-yellow-500/5", iconColor: "text-pink-400" },
  { id: "futures" as ViewType, icon: BarChart3, title: "Emotion Futures", description: "Predict next week's trends", badge: "Market", credits: 2, gradient: "from-emerald-500/10 to-cyan-500/5", iconColor: "text-emerald-400" },
  { id: "leaderboard" as ViewType, icon: Trophy, title: "Leaderboard", description: "Global rankings & top traders", badge: "Free", gradient: "from-yellow-500/10 to-orange-500/5", iconColor: "text-yellow-400" },
  { id: "insurance" as ViewType, icon: Shield, title: "Emotion Insurance", description: "Protect from negativity", gradient: "from-violet-500/10 to-pink-500/5", iconColor: "text-violet-400" },
  { id: "drops" as ViewType, icon: Heart, title: "Emotion Drops", description: "Join massive emotion events", gradient: "from-pink-500/10 to-red-500/5", iconColor: "text-pink-400" },
];

export default function EmotionEconomy() {
  const [activeView, setActiveView] = useState<ViewType>("hub");

  const renderView = () => {
    switch (activeView) {
      case "feed": return <EmotionFeed onBack={() => setActiveView("hub")} />;
      case "wallet": return <EmotionWallet onBack={() => setActiveView("hub")} />;
      case "market": return <EmotionMarket onBack={() => setActiveView("hub")} />;
      case "mining": return <EmotionMining onBack={() => setActiveView("hub")} />;
      case "insurance": return <EmotionInsurance onBack={() => setActiveView("hub")} />;
      case "drops": return <EmotionDrops onBack={() => setActiveView("hub")} />;
      case "roulette": return <EmotionRoulette onBack={() => setActiveView("hub")} />;
      case "leaderboard": return <EmotionLeaderboard onBack={() => setActiveView("hub")} />;
      case "therapist": return <AIMoodTherapist onBack={() => setActiveView("hub")} />;
      case "futures": return <EmotionFutures onBack={() => setActiveView("hub")} />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title={'Emotion Economy'}
        intro={"Send emotions as micro-gifts — trade, collect, and earn from creators' reactions."}
        steps={[
          { title: 'Send an emotion', desc: 'Tap any post to send Joy, Love, Awe, etc. as a paid micro-gift.' },
        { title: 'Creators earn', desc: 'Recipients receive a share of every emotion sent to their content.' },
        { title: 'Trade the market', desc: 'Emotion values fluctuate — buy low, gift high, or hold rare drops.' },
        { title: 'Withdraw earnings', desc: 'Creators cash out via Stripe Connect (80/20 split).' }
        ]}
      />
      <div className="container mx-auto px-4 pt-20 pb-8 space-y-8">
        {/* Cinematic Hero */}
        <EmotionEconomyHero />

        <HeroRewardedAd sectionKey="page_emotioneconomy" />

        {/* Engagement Row */}
        <EmotionEconomyEngagement />

        {/* Tool Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4">Explore Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool, i) => (
              <EmotionEconomyToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                badge={tool.badge}
                credits={tool.credits}
                gradient={tool.gradient}
                iconColor={tool.iconColor}
                onClick={() => setActiveView(tool.id)}
                delay={0.05 * i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
