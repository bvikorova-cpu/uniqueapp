import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, Car, Trophy, Users, Flame, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import heroVideo from "@/assets/gp-racing-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const stats = [
  { icon: Car, value: "1,200+", label: "Active Cars", color: "text-cyan-400" },
  { icon: Trophy, value: "340+", label: "Races Completed", color: "text-amber-400" },
  { icon: Users, value: "8.5K", label: "Racers Online", color: "text-emerald-400" },
  { icon: Gauge, value: "€42K", label: "Prize Pool", color: "text-violet-400" },
];

export function GPRacingHero({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

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
      <FloatingHowItWorks title={"G P Racing Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the G P Racing Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in G P Racing Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="relative h-[70svh] min-h-[480px] overflow-hidden rounded-2xl mx-2 md:mx-0 bg-slate-950">
      {/* Video */}
      <video ref={videoRef} autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo.url}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.03) 2px, rgba(0,229,255,0.03) 4px)',
      }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />

      {/* HUD corner accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-cyan-400/40 rounded-tl-lg" />
      <div className="absolute top-4 right-16 w-12 h-12 border-r-2 border-t-2 border-cyan-400/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-cyan-400/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-cyan-400/40 rounded-br-lg" />

      {/* Video Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button size="icon" variant="ghost" onClick={togglePlay}
          className="h-9 w-9 rounded-full bg-slate-950/60 backdrop-blur-sm text-cyan-400 hover:bg-slate-950/80 border border-cyan-500/20">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute}
          className="h-9 w-9 rounded-full bg-slate-950/60 backdrop-blur-sm text-cyan-400 hover:bg-slate-950/80 border border-cyan-500/20">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-10 pb-6 md:pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-cyan-500/15 backdrop-blur-sm rounded-full border border-cyan-400/30">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-mono text-xs uppercase tracking-[0.2em]">
              Racing Command Center
            </span>
          </div>

          <h1 className="text-[clamp(2.2rem,11vw,4.5rem)] font-black font-mono leading-[1.05] mb-3 max-w-[20ch]"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #00e5ff 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            GP Racing Arena
          </h1>

          <p className="text-cyan-100/70 text-sm md:text-lg max-w-xl mb-6 leading-relaxed font-mono">
            Build your machine. Dominate the circuits. Claim the championship.
          </p>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => onNavigate("garage")} size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono uppercase tracking-wider border border-cyan-400/30 shadow-lg shadow-cyan-500/30">
              🏎️ Enter Arena
            </Button>
            {!user && (
              <Button onClick={() => navigate("/auth")} variant="outline" size={isMobile ? "default" : "lg"}
                className="border-cyan-400/30 text-cyan-300 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-sm font-mono uppercase tracking-wider">
                Sign In
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/60 backdrop-blur-md border border-cyan-500/20">
              <div className="relative">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div className={`absolute -inset-2 rounded-full blur-md opacity-30 ${stat.color.replace('text-', 'bg-')}`} />
              </div>
              <div>
                <p className="font-mono font-bold text-white text-sm md:text-lg">{stat.value}</p>
                <p className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
    </>
  );
}
