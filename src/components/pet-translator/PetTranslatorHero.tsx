import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Heart, Users, Sparkles, Crown, Mic } from "lucide-react";
import heroVideo from "@/assets/pet-translator-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

function getDailyTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { hours, minutes };
}

interface PetTranslatorHeroProps {
  totalTranslations: number;
  totalUsers: number;
  streak: number;
  isSubscribed: boolean;
}

export default function PetTranslatorHero({ totalTranslations, totalUsers, streak, isSubscribed }: PetTranslatorHeroProps) {
  const [timeLeft, setTimeLeft] = useState(getDailyTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getDailyTimeLeft()), 60000);
    return (
    <>
      <FloatingHowItWorks title={"Pet Translator Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Translator Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Translator Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  const statCards = [
    { value: totalTranslations > 0 ? totalTranslations.toLocaleString() : "—", label: "Translations", icon: Mic, accent: "from-purple-500/20 to-violet-500/10", iconColor: "text-purple-400" },
    { value: `${timeLeft.hours}h ${timeLeft.minutes}m`, label: "Challenge Ends", icon: Sparkles, accent: "from-pink-500/20 to-rose-500/10", iconColor: "text-pink-400" },
    { value: totalUsers > 0 ? totalUsers.toLocaleString() : "—", label: "Pet Owners", icon: Users, accent: "from-violet-500/20 to-purple-500/10", iconColor: "text-violet-400" },
    { value: streak > 0 ? `${streak}🔥` : "—", label: "Your Streak", icon: Heart, accent: "from-fuchsia-500/20 to-pink-500/10", iconColor: "text-fuchsia-400" },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Video Container - badges on top, title at bottom, video fully visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Video - no min-height forcing, natural aspect ratio */}
        <div className="relative w-full aspect-video">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.85) saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e]/90 via-transparent to-[#1a0a2e]/30" />
        </div>

        {/* Badges - top left */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <Badge className="bg-purple-500/90 text-white font-bold border-purple-400/50 shadow-lg shadow-purple-500/20">
              <PawPrint className="h-3 w-3 mr-1" /> Magical Purple
            </Badge>
          </motion.div>
          {isSubscribed && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
              <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20">
                <Crown className="h-3 w-3 mr-1" /> Premium Active
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Title - bottom overlay, compact */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-purple-400/30 bg-[#1a0a2e]/50 backdrop-blur-lg rounded-xl px-4 py-3 w-fit max-w-full"
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white drop-shadow-lg">
              🐾 AI PET <span className="text-purple-400">TRANSLATOR</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-semibold mt-0.5 drop-shadow">
              Decode your pet's emotions, train smarter & keep them healthy with AI
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stat Cards below video */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
            className={`rounded-xl bg-gradient-to-br ${item.accent} bg-card/80 backdrop-blur-md border border-border/30 p-3 sm:p-4 text-center`}
          >
            <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.iconColor} mx-auto mb-1`} />
            <p className="text-lg sm:text-2xl font-black">{item.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
