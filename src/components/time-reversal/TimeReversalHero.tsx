import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Timer, TrendingDown, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TimeReversalHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110" autoPlay muted loop playsInline>
        <source src="/__l5e/assets-v1/7d3ecbfe-9bcb-4577-9a77-d3a46480a98f/time-reversal-hero-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button size="icon" variant="ghost" onClick={togglePlay} className="bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute} className="bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-block mb-4 px-5 py-1.5 bg-purple-500/30 backdrop-blur-sm rounded-full border border-purple-400/40">
            <span className="text-purple-200 font-semibold text-sm uppercase tracking-wider">Time Reversal Social</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-[1.05]"
          style={{
            WebkitTextStroke: "1.5px rgba(0,0,0,0.5)",
            textShadow: "0 0 40px rgba(168,85,247,0.4), 0 4px 15px rgba(0,0,0,0.7)",
            background: "linear-gradient(135deg, #fff 0%, #d8b4fe 40%, #c084fc 70%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Live Your Life<br />Backwards
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/90 text-base md:text-lg max-w-2xl mb-6 leading-relaxed"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
        >
          Start at 80, get younger every day. Watch followers experience your life in reverse through AI-powered age transformation.
        </motion.p>

        {/* Glassmorphic Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-wrap gap-3"
        >
          {[
            { icon: Timer, label: "Years Reversed", value: "2.4K" },
            { icon: TrendingDown, label: "Age Transformations", value: "18.7K" },
            { icon: Users, label: "Active Travelers", value: "6.2K" },
            { icon: Sparkles, label: "Time Paradoxes", value: "892" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
              <stat.icon className="h-4 w-4 text-purple-300" />
              <div>
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-white/60 text-[10px]">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
