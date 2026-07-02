import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, Trophy, Users, Heart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import heroVideo from "@/assets/masterchef-hero-v2.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const stats = [
  { icon: Trophy, value: "500+", label: "Competitions", shortLabel: "Comps" },
  { icon: Users, value: "12K+", label: "Active Chefs", shortLabel: "Chefs" },
  { icon: Heart, value: "2.4M", label: "Total Votes", shortLabel: "Votes" },
  { icon: DollarSign, value: "€85K", label: "Prize Pool", shortLabel: "Prizes" },
];

export function MasterChefHero() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  return (
    <>
      <FloatingHowItWorks title={"Master Chef Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Master Chef Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Master Chef Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="relative h-[76svh] min-h-[520px] overflow-hidden rounded-2xl mx-2 md:mx-0 bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo.url}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      
      {/* Video Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button size="icon" variant="ghost" onClick={togglePlay}
          className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 active:scale-[0.97]">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute}
          className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 active:scale-[0.97]">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-10 pb-6 md:pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-block mb-3 px-4 py-1.5 bg-orange-500/30 backdrop-blur-sm rounded-full border border-orange-400/40">
            <span className="text-orange-300 font-semibold text-xs uppercase tracking-wider">
              🔥 Online Cooking Competition Platform
            </span>
          </div>
          
          <h1 className="text-[clamp(2.2rem,11vw,4.5rem)] font-black leading-[1.05] mb-3 max-w-[20ch]"
            style={{
              WebkitTextStroke: '1.5px rgba(255,255,255,0.15)',
              textShadow: '0 0 40px rgba(249,115,22,0.4), 0 4px 20px rgba(0,0,0,0.6)',
              background: 'linear-gradient(135deg, #fff 0%, #fdba74 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            KitchenStars Arena
          </h1>
          
          <p className="text-white/80 text-sm md:text-lg max-w-xl mb-6 leading-relaxed">
            Compete, cook, and conquer. Join live cooking battles, get community votes, and win real prizes.
          </p>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => navigate("/masterchef/competitions-public")} size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold active:scale-[0.97] shadow-lg shadow-orange-500/30">
              🏆 Browse Competitions
            </Button>
            <Button onClick={() => navigate("/masterchef/dashboard")} variant="outline" size={isMobile ? "default" : "lg"}
              className="border-white/30 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm active:scale-[0.97]">
              Dashboard
            </Button>
          </div>
        </motion.div>

        {/* 4-Stat Compact Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <stat.icon className="h-5 w-5 text-orange-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-white font-bold text-lg leading-tight">{stat.value}</div>
                <div className="text-white/60 text-xs truncate">{isMobile ? stat.shortLabel : stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
    </>
  );
}
