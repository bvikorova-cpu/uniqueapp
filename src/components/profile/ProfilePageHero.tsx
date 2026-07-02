import { motion } from "framer-motion";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/profile-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ProfilePageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onBack?: () => void;
  badge?: string;
}

export const ProfilePageHero = ({ icon: Icon, title, subtitle, onBack, badge }: ProfilePageHeroProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Profile Page Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Page Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Page Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full overflow-hidden rounded-3xl border border-amber-500/20 mb-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.0) saturate(1.2) contrast(1.05)" }}
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/55 via-black/40 to-amber-950/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />

      <div className="relative z-10 px-5 sm:px-8 py-7 sm:py-9">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 text-amber-100 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative shrink-0"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/40 to-violet-400/30 rounded-full blur-lg" />
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-violet-500/30 border border-amber-400/40 backdrop-blur-md flex items-center justify-center">
              <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-amber-300" />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            {badge && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-full mb-1"
              >
                {badge}
              </motion.span>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent leading-tight"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-amber-50/85 mt-1"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
            >
              {subtitle}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
