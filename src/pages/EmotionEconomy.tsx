import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, MessageSquare, Wand2, Shuffle } from "lucide-react";
import { EmotionEconomyHero } from "@/components/emotion-economy/EmotionEconomyHero";
import { EmotionEconomyToolCard } from "@/components/emotion-economy/EmotionEconomyToolCard";
import { EmotionRoulette } from "@/components/emotion-economy/EmotionRoulette";
import { AIMoodTherapist } from "@/components/emotion-economy/AIMoodTherapist";
import { MoodEmotionGenerator } from "@/components/emotion-economy/MoodEmotionGenerator";
import { EmotionExchange } from "@/components/emotion-economy/EmotionExchange";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ViewType = "hub" | "roulette" | "therapist" | "mood-generator" | "exchange";

const tools = [
  { id: "therapist" as ViewType, icon: MessageSquare, title: "AI Mood Therapist", description: "AI-powered mood & portfolio advice", badge: "AI", credits: 1, gradient: "from-cyan-500/10 to-violet-500/5", iconColor: "text-cyan-400" },
  { id: "roulette" as ViewType, icon: RotateCw, title: "Emotion Roulette", description: "Spin the wheel, win 2x!", badge: "Game", credits: 1, gradient: "from-pink-500/10 to-yellow-500/5", iconColor: "text-pink-400" },
  { id: "mood-generator" as ViewType, icon: Wand2, title: "Mood Emotion Generator", description: "Turn your current mood into emotion units", badge: "AI", credits: 2, gradient: "from-violet-500/10 to-pink-500/5", iconColor: "text-violet-400" },
  { id: "exchange" as ViewType, icon: Shuffle, title: "Emotion Exchange", description: "Random swap with another user", badge: "Match", credits: 1, gradient: "from-cyan-500/10 to-emerald-500/5", iconColor: "text-cyan-400" },
];

export default function EmotionEconomy() {
  const [activeView, setActiveView] = useState<ViewType>("hub");

  const renderView = () => {
    switch (activeView) {
      case "roulette": return <EmotionRoulette onBack={() => setActiveView("hub")} />;
      case "therapist": return <AIMoodTherapist onBack={() => setActiveView("hub")} />;
      case "mood-generator": return <MoodEmotionGenerator onBack={() => setActiveView("hub")} />;
      case "exchange": return <EmotionExchange onBack={() => setActiveView("hub")} />;
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
        intro={"Two focused tools: get AI mood guidance or spin the emotion roulette."}
        steps={[
          { title: 'Pick a tool', desc: 'Choose AI Mood Therapist or Emotion Roulette.' },
          { title: 'Spend credits', desc: 'Each action costs 1 credit, deducted server-side.' },
          { title: 'Get results', desc: 'Therapist replies with advice; roulette can pay out 2x.' },
        ]}
      />
      <div className="container mx-auto px-4 pt-20 pb-8 space-y-8">
        <EmotionEconomyHero />

        <HeroRewardedAd sectionKey="page_emotioneconomy" />

        <div>
          <h2 className="text-xl font-bold mb-4">Explore Tools</h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
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
