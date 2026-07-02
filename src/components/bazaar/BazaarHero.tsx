import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import bazaarHeroAsset from "@/assets/bazaar-hero-v2.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BazaarHeroProps {
  itemCount: number;
}

export const BazaarHero = ({ itemCount }: BazaarHeroProps) => {
  const [stats, setStats] = useState({ items: 0, sellers: 0, orders: 0, satisfaction: 0 });

  useEffect(() => {
    const target = { items: itemCount || 247, sellers: 89, orders: 1240, satisfaction: 98 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setStats({
        items: Math.round(target.items * ease),
        sellers: Math.round(target.sellers * ease),
        orders: Math.round(target.orders * ease),
        satisfaction: Math.round(target.satisfaction * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [itemCount]);

  const statCards = [
    { icon: Package, label: "Active Listings", value: stats.items.toLocaleString() },
    { icon: Users, label: "Verified Sellers", value: stats.sellers.toLocaleString() },
    { icon: ShoppingCart, label: "Completed Orders", value: stats.orders.toLocaleString() },
    { icon: TrendingUp, label: "Satisfaction", value: `${stats.satisfaction}%` },
  ];

  return (
    <div className="mb-8 space-y-3">
      {/* Video with title overlay */}
      <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(1.3) saturate(1.2)" }}
          src={bazaarHeroAsset.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block border-2 border-amber-400/40 bg-card/30 backdrop-blur-lg rounded-2xl px-6 py-4">
              <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg">
                Online <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Bazaar</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-lg font-semibold mt-1 drop-shadow">
                Buy & sell with confidence in our trusted community
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats grid below video */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-3 sm:p-4 text-center"
          >
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
