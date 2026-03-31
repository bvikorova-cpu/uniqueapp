import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, Palette, Star, TrendingUp } from "lucide-react";
import heroVideo from "@/assets/tattoo-hero.mp4.asset.json";

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
    { icon: Users, label: "Artists", value: stats.artists.toLocaleString() },
    { icon: Palette, label: "Styles", value: stats.styles.toString() },
    { icon: Star, label: "Rating", value: stats.rating.toFixed(1) },
  ];

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-2xl mb-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1
            className="text-4xl md:text-6xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #F5E6C8, #D4AF37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "1.5px rgba(212,175,55,0.3)",
              textShadow: "0 0 40px rgba(212,175,55,0.4)",
            }}
          >
            AI Tattoo Atelier
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
            Luxury AI-Powered Tattoo Design Studio
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 text-center"
            >
              <stat.icon className="h-5 w-5 mx-auto mb-1 text-amber-400" />
              <p className="text-xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
