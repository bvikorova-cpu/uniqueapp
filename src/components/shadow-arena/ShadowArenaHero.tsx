import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Ghost, Skull, Eye, Play, Pause, Volume2, VolumeX, Flame, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import shadowVideo from "@/assets/shadow-arena-hero.mp4.asset.json";
import shadowPoster from "@/assets/shadow-arena-poster.jpg";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  totalPrizePool?: number;
  activeBattles?: number;
  topStories?: number;
}

export function ShadowArenaHero({ totalPrizePool = 0, activeBattles = 0, topStories = 0 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const stats = [
    { icon: Flame, label: "Prize Pool", value: `€${totalPrizePool.toFixed(2)}` },
    { icon: Skull, label: "Active Battles", value: activeBattles.toString() },
    { icon: Eye, label: "Top Stories", value: topStories.toString() },
    { icon: Ghost, label: "Platform Cut", value: "20%" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Shadow Arena Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Shadow Arena Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Shadow Arena Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden rounded-3xl border border-red-900/30 mb-8 shadow-[0_0_60px_-15px_rgba(127,29,29,0.5)]">
      {/* Cinematic horror video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={shadowPoster}
      >
        <source src={shadowVideo.url} type="video/mp4" />
      </video>

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[hsl(0,30%,5%)]/60 to-black/90" />
      <div className="absolute inset-0 shadow-vignette" />
      <div className="absolute inset-0 shadow-grain opacity-40" />

      {/* Animated fog particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-red-900/15 blur-3xl pointer-events-none"
          style={{
            left: `${(i * 11) % 100}%`,
            top: `${20 + ((i * 17) % 60)}%`,
            width: 80 + (i % 4) * 40,
            height: 80 + (i % 4) * 40,
          }}
          animate={{ x: [-30, 30, -30], opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: 8 + i, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 sm:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/50 backdrop-blur-md text-red-200 text-xs font-semibold border border-red-800/40">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            {"Live Horror Arena · AI-Powered"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight"
        >
          <motion.span
            className="block font-gothic-display shadow-blood-text shadow-flicker"
            animate={{ skewX: [0, -1.2, 0, 1.2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            {"Shadow Arena"}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-red-100/85 max-w-2xl mb-8 font-gothic-body italic"
        >
          {"Where terror meets glory. Forge horror with AI, battle live, and claim cash prizes from a pool of fear."}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          <Button
            size="lg"
            onClick={() => navigate("/shadow-arena/submit-story")}
            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 border border-red-700/40 shadow-[0_0_25px_-5px_rgba(220,38,38,0.6)]"
          >
            <Skull className="mr-2 h-4 w-4" />
            {"Submit Horror Story"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/shadow-arena/battles")}
            className="bg-black/40 backdrop-blur-md border-purple-700/40 text-purple-100 hover:bg-purple-950/40"
          >
            <Flame className="mr-2 h-4 w-4" />
            {"Enter Live Battles"}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl w-full"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="bg-black/70 backdrop-blur-md rounded-xl p-3 text-center border border-red-700/40 shadow-lg"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-red-300" />
                <span className="text-lg sm:text-2xl font-black text-white drop-shadow-md">{stat.value}</span>
              </div>
              <span className="text-xs text-red-100 font-semibold">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 backdrop-blur-md hover:bg-black/70 border border-red-900/40 text-red-200"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 backdrop-blur-md hover:bg-black/70 border border-red-900/40 text-red-200"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
    </>
  );
}
