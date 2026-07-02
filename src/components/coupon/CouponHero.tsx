import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, Users, ShoppingCart, TrendingUp } from "lucide-react";
import couponHeroAsset from "@/assets/coupon-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CouponHeroProps {
  couponCount: number;
}

export const CouponHero = ({ couponCount }: CouponHeroProps) => {
  const [stats, setStats] = useState({ coupons: 0, sellers: 0, saved: 0, satisfaction: 0 });

  useEffect(() => {
    const target = { coupons: couponCount || 156, sellers: 72, saved: 8400, satisfaction: 97 };
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - Math.min(step / steps, 1), 3);
      setStats({
        coupons: Math.round(target.coupons * ease),
        sellers: Math.round(target.sellers * ease),
        saved: Math.round(target.saved * ease),
        satisfaction: Math.round(target.satisfaction * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, 33);
    return (
    <>
      <FloatingHowItWorks title={"Coupon Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [couponCount]);

  const statCards = [
    { icon: Ticket, label: "Active Coupons", value: stats.coupons.toLocaleString() },
    { icon: Users, label: "Verified Sellers", value: stats.sellers.toLocaleString() },
    { icon: ShoppingCart, label: "Total Saved", value: `€${stats.saved.toLocaleString()}` },
    { icon: TrendingUp, label: "Satisfaction", value: `${stats.satisfaction}%` },
  ];

  return (
    <div className="mb-8 space-y-3">
      <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.2) saturate(1.3)" }} src={couponHeroAsset.url} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-purple-900/20" />
        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-block max-w-[82%] sm:max-w-xl border border-white/20 bg-card/20 backdrop-blur-md rounded-2xl px-5 py-4 sm:px-6 sm:py-5 shadow-2xl">
              <h1 className="text-3xl leading-none sm:text-5xl font-black text-white drop-shadow-lg">
                Coupon <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">Marketplace</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-lg font-semibold mt-2 max-w-md drop-shadow">
                Buy & sell coupons, gift cards & vouchers at exclusive prices
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-3 sm:p-4 text-center">
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
