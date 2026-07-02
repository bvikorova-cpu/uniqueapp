import { motion } from "framer-motion";
import { Briefcase, Users, ShoppingBag, Star } from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/marketplace-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const MarketplaceHero = () => {
  const { stats, loading } = useLiveStats([
    { key: "services", table: "skill_offerings" },
    { key: "orders", table: "service_orders" },
    { key: "providers", table: "marketplace_subscriptions" },
  ]);

  const statItems = [
    { icon: ShoppingBag, label: "Active Services", value: stats.services },
    { icon: Users, label: "Providers", value: stats.providers },
    { icon: Briefcase, label: "Orders Completed", value: stats.orders },
    { icon: Star, label: "Satisfaction", value: null },
  ];

  const fmt = (v: number | null | undefined) => {
    if (loading) return "—";
    if (!v) return "—";
    return v.toLocaleString();
  };

  return (
    <>
      <FloatingHowItWorks title={"Marketplace Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Marketplace Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Marketplace Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-3xl overflow-hidden mb-8 sm:mb-12"
    >
      <div className="absolute inset-0 z-0">
        <video
          autoPlay loop muted playsInline
          className="w-full h-full object-cover"
          style={{ filter: "brightness(1.1) saturate(1.2)" }}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-transparent to-indigo-900/20" />
      </div>

      <div className="relative z-10 px-6 py-12 sm:py-16 lg:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white mb-4"
        >
          <Briefcase className="w-4 h-4" />
          <span className="font-medium">Premium Skills Marketplace</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-block mb-3"
        >
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white px-6 py-3 rounded-2xl bg-black/20 backdrop-blur-lg border-2 border-white/10"
            style={{ textShadow: "0 2px 20px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.2)" }}
          >
            💼 SKILLS MARKETPLACE 💼
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/90 text-sm sm:text-lg max-w-2xl mx-auto mb-8 font-semibold"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          Connect with skilled professionals or monetize your expertise. From creative design to tech services — find the perfect match.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {statItems.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="relative group p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all"
            >
              <s.icon className="w-5 h-5 text-violet-300 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-white">{fmt(s.value)}</div>
              <p className="text-[11px] text-white/70 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};
