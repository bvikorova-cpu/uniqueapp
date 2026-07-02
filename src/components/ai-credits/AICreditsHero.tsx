import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroVideo from "@/assets/ai-credits-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AICreditsHeroProps {
  credits: number;
  totalPurchased: number;
  onScrollToPackages: () => void;
}

/**
 * Cinematic AI Credits hero with neural-network video,
 * matching the property-marketplace style.
 */
export const AICreditsHero = ({ credits, totalPurchased, onScrollToPackages }: AICreditsHeroProps) => {
  return (
    <>
      <FloatingHowItWorks title={"A I Credits Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Credits Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Credits Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full min-h-[560px] sm:min-h-[520px] sm:h-[520px] rounded-3xl overflow-hidden mb-8 border border-primary/20">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.3) contrast(1.1)" }}
        src={heroVideo.url}
      />
      {/* Cinematic gradient stack */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-transparent to-purple-500/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,transparent_30%,rgba(0,0,0,0.45)_100%)]" />

      <div className="relative z-10 h-full flex flex-col justify-end pt-16 sm:pt-12 px-5 sm:px-12 pb-6 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary/30 to-purple-500/30 border border-primary/50 text-white backdrop-blur-xl px-3 py-1.5 shadow-lg">
            <Brain className="h-3.5 w-3.5 mr-1.5" /> AI Credits Engine
          </Badge>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            Power your{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-primary to-purple-400 bg-clip-text text-transparent">
              creative AI
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
            One credit pool fuels every AI tool — image generation, editing, style transfer, upscaling, AI mentors.
            Buy once, use across the whole platform.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/70 border-2 border-cyan-400/60 backdrop-blur-xl shadow-xl shadow-black/40">
              <Sparkles className="h-5 w-5 text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{credits.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Credits available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/70 border-2 border-purple-400/60 backdrop-blur-xl shadow-xl shadow-black/40">
              <Cpu className="h-5 w-5 text-purple-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{totalPurchased.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Lifetime credits</p>
              </div>
            </div>
            <Button
              onClick={onScrollToPackages}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-bold shadow-lg shadow-primary/40 self-center"
            >
              <Zap className="mr-2 h-4 w-4" /> Top up credits
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};
