import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video, Users, Sparkles, TrendingUp } from "lucide-react";
import heroVideo from "@/assets/video-ad-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const useLiveStats = () => {
  const [stats, setStats] = useState({ ads: 18420, creators: 3150, scripts: 92500, platforms: 6 });
  useEffect(() => {
    const i = setInterval(() => {
      setStats(p => ({
        ads: p.ads + Math.floor(Math.random() * 3),
        creators: p.creators + (Math.random() > 0.7 ? 1 : 0),
        scripts: p.scripts + Math.floor(Math.random() * 5),
        platforms: 6,
      }));
    }, 4000);
    return () => clearInterval(i);
  }, []);
  return stats;
};

export const VideoAdHero = () => {
  const stats = useLiveStats();
  const statItems = [
    { icon: Video, label: "Ads Generated", value: stats.ads.toLocaleString() },
    { icon: Users, label: "Active Creators", value: stats.creators.toLocaleString() },
    { icon: Sparkles, label: "Scripts Written", value: stats.scripts.toLocaleString() },
    { icon: TrendingUp, label: "Platforms", value: stats.platforms.toString() },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-[340px] md:h-[380px]">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(1.3) saturate(1.2)' }}>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="border-2 border-white/20 bg-card/40 backdrop-blur-lg rounded-2xl px-6 md:px-10 py-4 mb-4 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Video Ad <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Studio</span>
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-white/90 font-semibold text-sm md:text-base max-w-xl drop-shadow-md">
          AI-Powered Video Advertising Suite — Create, Optimize & Scale Your Campaigns
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-4 gap-2 md:gap-4 mt-6 w-full max-w-2xl">
          {statItems.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-3 border border-white/10">
              <s.icon className="w-4 h-4 md:w-5 md:h-5 text-orange-300 mx-auto mb-1" />
              <div className="text-white font-bold text-sm md:text-lg">{s.value}</div>
              <div className="text-white/60 text-[10px] md:text-xs">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
