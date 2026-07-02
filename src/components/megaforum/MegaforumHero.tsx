import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, TrendingUp, Flame, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroAsset from "@/assets/megaforum-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MegaforumHeroProps {
  totalPosts: number;
  totalUsers: number;
  todayPosts: number;
  trendingTopics: number;
}

export const MegaforumHero = ({ totalPosts, totalUsers, todayPosts, trendingTopics }: MegaforumHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stats = [
    { icon: MessageSquare, label: "Posts", value: totalPosts.toLocaleString(), color: "text-emerald-400" },
    { icon: Users, label: "Members", value: totalUsers.toLocaleString(), color: "text-blue-400" },
    { icon: TrendingUp, label: "Today", value: todayPosts.toLocaleString(), color: "text-amber-400" },
    { icon: Flame, label: "Trending", value: trendingTopics.toLocaleString(), color: "text-rose-400" },
  ];

  return (
    <div className="relative w-full h-[340px] sm:h-[400px] rounded-2xl overflow-hidden mb-8">
      <FloatingHowItWorks
        title={"Megaforum Hero"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroAsset.url} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button size="icon" variant="ghost" onClick={togglePlay} className="bg-black/40 hover:bg-black/60 text-white h-8 w-8">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute} className="bg-black/40 hover:bg-black/60 text-white h-8 w-8">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            🌐 Premium Community • Members Only
          </span>
          <h1
            className="text-3xl sm:text-5xl font-black text-white mb-2"
            style={{
              textShadow: "0 0 30px rgba(16,185,129,0.4), 0 2px 10px rgba(0,0,0,0.8)",
              WebkitTextStroke: "1px rgba(0,0,0,0.3)",
            }}
          >
            MEGAFORUM
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-lg" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            The ultimate community hub. Discuss, debate, vote and connect with people worldwide.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <div>
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-white/60 text-[10px]">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
