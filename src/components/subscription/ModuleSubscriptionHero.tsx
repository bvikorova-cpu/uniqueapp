import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import subscriptionHeroAsset from "@/assets/subscription-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ModuleSubscriptionHeroProps {
  /** Module display name e.g. "Nutrition Hub" */
  module: string;
  /** Big headline */
  title: string;
  /** Sub-headline */
  subtitle: string;
  /** Module accent icon */
  icon: LucideIcon;
  /** Optional badge text shown at top (e.g. "Most loved by chefs") */
  badge?: string;
  /** Optional video override; defaults to shared subscription hero */
  videoUrl?: string;
}

/**
 * Shared cinematic video hero used by every module-specific subscription page
 * (Nutrition, KitchenStars, F1, Kids, Time Capsule, etc.) so they all match
 * the main /subscription premium look.
 */
export const ModuleSubscriptionHero = ({
  module,
  title,
  subtitle,
  icon: Icon,
  badge,
  videoUrl,
}: ModuleSubscriptionHeroProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Module Subscription Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Module Subscription Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Module Subscription Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[260px] sm:h-[340px] rounded-3xl overflow-hidden mb-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.15)" }}
        src={videoUrl || subscriptionHeroAsset.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-transparent to-purple-500/25" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full border border-primary/30 bg-background/40 backdrop-blur-xl">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
              {module}
            </span>
            {badge && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                {badge}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white drop-shadow-2xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/85 drop-shadow-lg">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
};
