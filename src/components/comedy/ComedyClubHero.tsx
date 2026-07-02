import { motion } from "framer-motion";
import { Mic2, Users, Video, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/comedy-club-hero-v3.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count > 0 ? `${count.toLocaleString()}${suffix}` : "—"}</span>;
};

export const ComedyClubHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const { stats, loading } = useLiveStats([
    { key: "comedians", table: "comedian_profiles" },
    { key: "shows", table: "comedy_shows" },
    { key: "battles", table: "comedy_battles" },
    { key: "clips", table: "comedy_clips" },
  ]);

  const statItems = [
    { icon: Mic2, label: "Comedians", value: stats.comedians || 0 },
    { icon: Video, label: "Shows", value: stats.shows || 0 },
    { icon: Trophy, label: "Battles", value: stats.battles || 0 },
    { icon: Users, label: "Clips", value: stats.clips || 0 },
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: "340px" }}>
      <video
        ref={videoRef}
        src={heroVideo.url}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3"
            style={{
              background: "linear-gradient(135deg, #f472b6, #a78bfa, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.15)",
              textShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(244,114,182,0.3)",
            }}
          >
            Comedy Club
          </h1>
          <p className="text-white/80 text-sm sm:text-lg max-w-xl mx-auto">
            Live Stand-Up • Comedy Battles • Earn Money Performing
          </p>
        </motion.div>
      </div>

      {/* Stats Grid Below Video */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="grid grid-cols-4 gap-1 sm:gap-2 px-2 sm:px-4 pb-3">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 sm:p-3 text-center"
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm sm:text-lg">
                <AnimatedCounter target={item.value} />
              </p>
              <p className="text-white/50 text-[10px] sm:text-xs">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full text-xs hover:bg-black/70 transition-colors"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
};
