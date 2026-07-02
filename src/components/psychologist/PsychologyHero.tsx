import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Users, MessageCircle, Heart, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/psychology-hero-v2.mp4.asset.json";
import { useLiveStats } from "@/hooks/useLiveStats";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PsychologyHero = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [psychStats, setPsychStats] = useState({ sessions: 0, messages: 0 });
  const { stats } = useLiveStats([
    { key: "moods", table: "psychology_mood_entries" as any },
    { key: "meditations", table: "psychology_meditation_sessions" as any },
  ]);

  // Use safe RPC for psychology stats (tables are RLS-locked, only edge fn can read)
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).rpc("get_psychology_stats");
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setPsychStats({
          sessions: Number(row.sessions_count) || 0,
          messages: Number(row.messages_count) || 0,
        });
      }
    })();
  }, []);

  const togglePlay = () => {
    const video = document.getElementById("psych-hero-video") as HTMLVideoElement;
    if (video) {
      if (isPlaying) video.pause();
      else video.play();
      setIsPlaying(!isPlaying);
    }
  };

  const statItems = [
    { icon: Brain, label: "Sessions", value: psychStats.sessions || "—" },
    { icon: Users, label: "Active Users", value: psychStats.messages || "—" },
    { icon: MessageCircle, label: "Mood Logs", value: stats.moods || "—" },
    { icon: Heart, label: "Meditations", value: stats.meditations || "—" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Psychology Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Psychology Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Psychology Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-background">
      <video
        id="psych-hero-video"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button size="icon" variant="ghost" onClick={togglePlay} className="bg-background/40 hover:bg-background/60 text-foreground">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)} className="bg-background/40 hover:bg-background/60 text-foreground">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground mb-2"
            style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.3)", textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>
            AI <span className="bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">Psychologist</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-6" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            Your safe space for mental wellness. Anonymous, empathetic, available 24/7.
          </p>
        </motion.div>

        {/* 4-Stat Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
        >
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-card/30 backdrop-blur-xl border border-border/30 rounded-xl p-3 sm:p-4 text-center"
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
