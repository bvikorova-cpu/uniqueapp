import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import vaultVideo from "@/assets/premium-store-vault.mp4.asset.json";

interface PremiumStoreHeroProps {
  credits: number;
  level: number;
  onBuyCredits: () => void;
}

/**
 * Cinematic Premium Store hero with treasure vault video,
 * matching the property marketplace look.
 */
export const PremiumStoreHero = ({ credits, level, onBuyCredits }: PremiumStoreHeroProps) => {
  return (
    <div className="relative w-full min-h-[600px] sm:min-h-[460px] rounded-3xl overflow-hidden mb-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.7) saturate(1.2)" }}
        src={vaultVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-transparent to-purple-500/25" />

      <div className="relative z-10 min-h-[600px] sm:min-h-[460px] flex flex-col justify-end p-5 sm:p-12">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Badge className="mb-3 bg-gradient-to-r from-amber-500/30 to-purple-500/30 border border-amber-400/40 text-amber-200 backdrop-blur-xl px-3 py-1.5">
            <Crown className="h-3.5 w-3.5 mr-1.5" /> Premium Vault
          </Badge>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
            Unlock the{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              Vault
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-lg text-white/90 drop-shadow-lg font-medium">
            Exclusive boosters, legendary badges, animated avatars and limited-edition collectibles.
            Spend credits, climb the leaderboard, gift items to friends.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="flex gap-2 sm:gap-3">

            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-black/70 border-2 border-amber-400/60 backdrop-blur-xl shadow-xl shadow-black/40">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300" />
              <div>
                <p className="text-lg sm:text-2xl font-black text-white leading-none">{credits.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-amber-100">Credits</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-black/70 border-2 border-purple-400/60 backdrop-blur-xl shadow-xl shadow-black/40">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-200" />
              <div>
                <p className="text-lg sm:text-2xl font-black text-white leading-none">Lvl {level}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-purple-100">XP unlocks rights</p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                onClick={onBuyCredits}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-500/90 hover:to-yellow-500/90 text-black font-bold shadow-lg shadow-amber-500/40"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Buy More Credits
              </Button>
            </div>


          </div>
        </motion.div>
      </div>
    </div>

  );
};
