import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Heart, Eye, TrendingUp, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/influking-hero.mp4";

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
    <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden mb-8">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={heroVideo}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Sci-Fi Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      
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
      <div className="absolute top-6 right-6 flex gap-2 z-20">
        <Button size="icon" variant="ghost" onClick={togglePlay}
          className="bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 h-9 w-9">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute}
          className="bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 h-9 w-9">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="mb-4"
        >
          <Crown className="h-16 w-16 md:h-20 md:w-20 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-center"
          style={{
            WebkitTextStroke: "1.5px rgba(139,92,246,0.5)",
            textShadow: "0 0 40px rgba(139,92,246,0.4), 0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          INFLU-KING
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/80 text-lg md:text-xl mt-2 text-center font-medium"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
        >
          Rise to the Top. Rule the Feed.
        </motion.p>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-3 text-center"
            >
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-white font-bold text-lg">{stat.value}</p>
              <p className="text-white/60 text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfluKingHero;
