import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import vaultVideo from "@/assets/premium-store-vault.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Premium Store Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Premium Store Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Premium Store Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[360px] sm:h-[460px] rounded-3xl overflow-hidden mb-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.2)" }}
        src={vaultVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-purple-500/25" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Badge className="mb-4 bg-gradient-to-r from-amber-500/30 to-purple-500/30 border border-amber-400/40 text-amber-200 backdrop-blur-xl px-3 py-1.5">
            <Crown className="h-3.5 w-3.5 mr-1.5" /> Premium Vault
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
            Unlock the{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              Vault
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/90 drop-shadow-lg font-medium">
            Exclusive boosters, legendary badges, animated avatars and limited-edition collectibles.
            Spend credits, climb the leaderboard, gift items to friends.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/70 border-2 border-amber-400/60 backdrop-blur-xl shadow-xl shadow-black/40">
              <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{credits.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Credits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/70 border-2 border-purple-400/60 backdrop-blur-xl shadow-xl shadow-black/40">
              <Star className="h-5 w-5 text-purple-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">Lvl {level}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">XP unlocks rights</p>
              </div>
            </div>
            <Button
              onClick={onBuyCredits}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-500/90 hover:to-yellow-500/90 text-black font-bold shadow-lg shadow-amber-500/40 self-center"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Buy More Credits
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};
