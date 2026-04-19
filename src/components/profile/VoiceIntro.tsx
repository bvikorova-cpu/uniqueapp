import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface VoiceIntroProps {
  userId: string;
  isOwnProfile: boolean;
}

export const VoiceIntro = ({ userId, isOwnProfile }: VoiceIntroProps) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: intro } = useQuery({
    queryKey: ["voice-intro", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile_voice_intros")
        .select("audio_url, duration_seconds, transcript")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  if (!intro && !isOwnProfile) return null;

  const toggle = () => {
    if (!intro?.audio_url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(intro.audio_url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-post-card p-4 mb-6 border border-violet-400/20 bg-gradient-to-br from-violet-950/40 to-card/40 backdrop-blur-xl flex items-center gap-3"
    >
      {intro?.audio_url ? (
        <>
          <button
            onClick={toggle}
            className="relative h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/40 hover:scale-105 transition-transform"
          >
            {playing ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
            {playing && (
              <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 uppercase tracking-wider">
              <Volume2 className="h-3 w-3" /> Voice intro
              {intro.duration_seconds && <span className="text-violet-400/70">· {intro.duration_seconds}s</span>}
            </div>
            {intro.transcript && <p className="text-sm text-foreground/80 italic truncate">"{intro.transcript}"</p>}
          </div>
        </>
      ) : (
        <>
          <div className="h-12 w-12 rounded-full bg-violet-500/20 border-2 border-dashed border-violet-400/40 flex items-center justify-center">
            <Mic className="h-5 w-5 text-violet-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-200">Add a voice intro</p>
            <p className="text-xs text-muted-foreground">Greet visitors with a 10s audio message (coming soon)</p>
          </div>
        </>
      )}
    </motion.div>
  );
};
