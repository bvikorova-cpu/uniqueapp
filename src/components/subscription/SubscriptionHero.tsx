import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, TrendingUp, Users } from "lucide-react";
import subscriptionHeroAsset from "@/assets/subscription-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SubscriptionHeroProps {
  currentTier?: string;
}

export const SubscriptionHero = ({ currentTier }: SubscriptionHeroProps) => {
  const [stats, setStats] = useState({ members: 0, saved: 0, rating: 0, countries: 0 });

  useEffect(() => {
    const target = { members: 28400, saved: 1.2, rating: 4.9, countries: 47 };
    const duration = 1800;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setStats({
        members: Math.round(target.members * ease),
        saved: +(target.saved * ease).toFixed(1),
        rating: +(target.rating * ease).toFixed(1),
        countries: Math.round(target.countries * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const statCards = [
    { icon: Users, label: "Active members", value: stats.members.toLocaleString() + "+" },
    { icon: TrendingUp, label: "Avg. saved/year", value: `€${stats.saved}k` },
    { icon: Sparkles, label: "User rating", value: `${stats.rating}/5` },
    { icon: Crown, label: "Countries", value: `${stats.countries}` },
  ];

  return (
    <div className="mb-10 space-y-4">
      {/* Cinematic video hero */}
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.9) saturate(1.15)" }}
          src={subscriptionHeroAsset.url}
        />
        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-purple-500/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/30 bg-background/40 backdrop-blur-xl">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-wider uppercase text-foreground/90">
                Unique Membership
              </span>
              {currentTier && currentTier !== "basic" && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {currentTier.toUpperCase()} ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
              Unlock the{" "}
              <span className="bg-gradient-to-r from-amber-400 via-primary to-purple-400 bg-clip-text text-transparent">
                full Unique
              </span>
              <br />
              experience
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/90 drop-shadow-lg font-medium">
              Join 28,000+ creators, sellers and dreamers who upgraded their journey.
              One subscription — every hub, every AI tool, zero limits.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 text-center hover:border-primary/50 transition-colors"
          >
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
