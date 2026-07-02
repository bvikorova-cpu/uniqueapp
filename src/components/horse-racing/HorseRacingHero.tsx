import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, Swords, Trophy, Users, Flame, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import heroVideo from "@/assets/horse-racing-hero-v2.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HorseRacingHeroProps {
  stats: {
    totalHorses: number;
    totalRaces: number;
    activeRaces: number;
    onlineTrainers: number;
  };
  onNavigate: (view: string) => void;
}

const statItems = [
  { icon: Swords, label: "Horses", color: "text-amber-400", key: "totalHorses" as const },
  { icon: Flame, label: "Races Run", color: "text-red-400", key: "totalRaces" as const },
  { icon: Flag, label: "Active Races", color: "text-emerald-400", key: "activeRaces" as const },
  { icon: Users, label: "Trainers Online", color: "text-cyan-400", key: "onlineTrainers" as const },
];

export const HorseRacingHero = ({ stats, onNavigate }: HorseRacingHeroProps) => {
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
      <FloatingHowItWorks title={"Horse Racing Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Racing Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Racing Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="relative h-[70svh] min-h-[480px] overflow-hidden rounded-2xl mx-2 md:mx-0 bg-slate-950">
      {/* Video */}
      <video ref={videoRef} autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.1]"
        src={heroVideo.url}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(218,165,32,0.02) 2px, rgba(218,165,32,0.02) 4px)',
      }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 to-transparent" />

      {/* HUD corner accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-amber-400/40 rounded-tl-lg" />
      <div className="absolute top-4 right-16 w-12 h-12 border-r-2 border-t-2 border-amber-400/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-amber-400/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-amber-400/40 rounded-br-lg" />

      {/* Video Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button size="icon" variant="ghost" onClick={togglePlay}
          className="h-9 w-9 rounded-full bg-slate-950/60 backdrop-blur-sm text-amber-400 hover:bg-slate-950/80 border border-amber-500/20">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMute}
          className="h-9 w-9 rounded-full bg-slate-950/60 backdrop-blur-sm text-amber-400 hover:bg-slate-950/80 border border-amber-500/20">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-10 pb-6 md:pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-amber-500/15 backdrop-blur-sm rounded-full border border-amber-400/30">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-mono text-xs uppercase tracking-[0.2em]">
              Racing Command Center
            </span>
          </div>

          <h1 className="text-[clamp(2.2rem,11vw,4.5rem)] font-black font-mono leading-[1.05] mb-3 max-w-[20ch]"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #f59e0b 50%, #dc2626 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            🏇 Horse Racing Arena
          </h1>

          <p className="text-amber-100/70 text-sm md:text-lg max-w-xl mb-6 leading-relaxed font-mono">
            Breed champions. Dominate the track. Claim the trophy.
          </p>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => onNavigate("stable")} size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-mono uppercase tracking-wider border border-amber-400/30 shadow-lg shadow-amber-500/30">
              🏇 Enter Arena
            </Button>
            {!user && (
              <Button onClick={() => navigate("/auth")} variant="outline" size={isMobile ? "default" : "lg"}
                className="border-amber-400/30 text-amber-300 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-sm font-mono uppercase tracking-wider">
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
          {statItems.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/60 backdrop-blur-md border border-amber-500/20">
              <div className="relative">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div className={`absolute -inset-2 rounded-full blur-md opacity-30 ${stat.color.replace('text-', 'bg-')}`} />
              </div>
              <div>
                <p className="font-mono font-bold text-white text-sm md:text-lg">
                  {stats[stat.key] === 0 ? "—" : stats[stat.key].toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-amber-400/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
    </>
  );
};
