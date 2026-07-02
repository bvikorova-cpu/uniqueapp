import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Heart, Eye, TrendingUp, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroAsset from "@/assets/influking-hero-v2.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const heroVideo = heroAsset.url;

interface InfluKingHeroProps {
  totalInfluencers: number;
  totalFollowers: number;
  totalLikes: number;
  totalViews: number;
}

const InfluKingHero = ({ totalInfluencers, totalFollowers, totalLikes, totalViews }: InfluKingHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const stats = [
    { icon: Users, label: "Influencers", value: totalInfluencers.toLocaleString(), color: "text-cyan-400" },
    { icon: Heart, label: "Total Likes", value: totalLikes.toLocaleString(), color: "text-pink-400" },
    { icon: Eye, label: "Total Views", value: totalViews.toLocaleString(), color: "text-emerald-400" },
    { icon: TrendingUp, label: "Followers", value: totalFollowers.toLocaleString(), color: "text-amber-400" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Influ King Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Influ King Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Influ King Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[76svh] min-h-[500px] sm:min-h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden mb-8 border border-border/40">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={heroVideo}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-110 saturate-110"
      />

      {/* Dark overlays for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-primary/30"
          animate={{ top: ["-2px", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Corner brackets - HUD style */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/60" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/60" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/60" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/60" />

      {/* Controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-20">
        <Button size="icon" variant="ghost" onClick={togglePlay}
          className="bg-black/40 hover:bg-black/60 text-white rounded-full h-9 w-9 sm:h-10 sm:w-10" aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute}
          className="bg-black/40 hover:bg-black/60 text-white rounded-full h-9 w-9 sm:h-10 sm:w-10" aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hero Content - bottom-left aligned for visibility */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 pt-20 sm:p-6 md:p-10 z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 mb-4 px-5 py-1.5 bg-amber-500/25 backdrop-blur-sm rounded-full border border-amber-400/40">
            <Crown className="h-4 w-4 text-amber-300" />
            <span className="text-amber-200 font-semibold text-sm uppercase tracking-wider">Influ-King</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}
          className="text-[clamp(2.2rem,11vw,3.5rem)] md:text-6xl lg:text-7xl font-black mb-3 leading-[1.02] max-w-[14ch]"
          style={{
            WebkitTextStroke: "1.5px rgba(0,0,0,0.5)",
            textShadow: "0 0 40px rgba(251,191,36,0.3), 0 4px 15px rgba(0,0,0,0.8)",
            background: "linear-gradient(135deg, #fff 0%, #fde68a 40%, #fbbf24 70%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Rise to the Top
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/90 text-sm sm:text-base md:text-lg max-w-[38ch] mb-5 sm:mb-6 leading-relaxed"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          Rule the feed, grow your empire, and monetize your influence with AI-powered tools and real-time analytics.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
          className="grid grid-cols-2 gap-2.5 w-full max-w-md"
        >
          {stats.map((stat, i) => (
            <div key={i} className="min-w-0 flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
              <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} />
              <div className="min-w-0">
                <div className="text-white font-bold text-sm sm:text-base leading-none">{stat.value}</div>
                <div className="text-white/60 text-[10px] sm:text-xs leading-tight">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default InfluKingHero;
