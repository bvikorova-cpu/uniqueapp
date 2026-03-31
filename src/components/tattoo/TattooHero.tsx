import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, Palette, Star, Crown, Gem } from "lucide-react";
import heroVideo from "@/assets/tattoo-hero-v2.mp4.asset.json";

const useLiveStats = () => {
  const [stats, setStats] = useState({
    designs: 24750,
    artists: 1840,
    styles: 156,
    rating: 4.9,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        designs: prev.designs + Math.floor(Math.random() * 3),
        artists: prev.artists + (Math.random() > 0.7 ? 1 : 0),
        styles: prev.styles,
        rating: prev.rating,
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

export const TattooHero = () => {
  const stats = useLiveStats();

  const statItems = [
    { icon: Sparkles, label: "Designs Created", value: stats.designs.toLocaleString() },
    { icon: Users, label: "Elite Artists", value: stats.artists.toLocaleString() },
    { icon: Palette, label: "Unique Styles", value: stats.styles.toString() },
    { icon: Star, label: "Client Rating", value: stats.rating.toFixed(1) },
  ];

  return (
    <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden rounded-2xl mb-8 border border-amber-500/20">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20" />

      {/* Decorative gold corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-amber-500/40 rounded-tl-xl" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-500/40 rounded-tr-xl" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-500/40 rounded-bl-xl" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-amber-500/40 rounded-br-xl" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Crown className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400/90 text-sm font-semibold tracking-[0.3em] uppercase">Premium Collection</span>
            <Crown className="h-5 w-5 text-amber-400" />
          </motion.div>

          <h1
            className="text-5xl md:text-7xl font-black mb-3 leading-tight"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #F5E6C8 30%, #D4AF37 50%, #B8860B 70%, #F5E6C8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "1.5px rgba(212,175,55,0.2)",
              textShadow: "0 0 60px rgba(212,175,55,0.5)",
              filter: "drop-shadow(0 0 20px rgba(212,175,55,0.3))",
            }}
          >
            AI Tattoo Atelier
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide"
          >
            Where Art Meets Artificial Intelligence — Bespoke Designs for the Bold
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-black/40 backdrop-blur-xl border border-amber-500/30 rounded-xl p-3 text-center shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-shadow"
            >
              <stat.icon className="h-5 w-5 mx-auto mb-1 text-amber-400" />
              <p className="text-xl md:text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] md:text-xs text-amber-400/60 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
