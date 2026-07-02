import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Play, Pause, Volume2, Loader2, X } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface VoiceIntroProps {
  userId: string;
  isOwnProfile: boolean;
}

export const VoiceIntro = ({ userId, isOwnProfile }: VoiceIntroProps) => {
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const qc = useQueryClient();

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
    if (!audioRef.current || audioRef.current.src !== intro.audio_url) {
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

  const generate = async () => {
    if (!text.trim() || text.length > 500) {
      toast.error("Please write between 1 and 500 characters.");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-voice-intro", {
        body: { text: text.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Voice intro saved!");
      setEditing(false);
      setText("");
      qc.invalidateQueries({ queryKey: ["voice-intro", userId] });
    } catch (e: any) {
      toast.error(e.message || "Failed to generate voice intro");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Voice Intro - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Intro section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Intro.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-post-card p-4 mb-6 border border-violet-400/20 bg-gradient-to-br from-violet-950/40 to-card/40 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        {intro?.audio_url ? (
          <>
            <button
              onClick={toggle}
              className="relative h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/40 hover:scale-105 transition-transform"
            >
              {playing ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
              {playing && <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 uppercase tracking-wider">
                <Volume2 className="h-3 w-3" /> Voice intro
                {intro.duration_seconds && <span className="text-violet-400/70">· ~{intro.duration_seconds}s</span>}
              </div>
              {intro.transcript && <p className="text-sm text-foreground/80 italic truncate">"{intro.transcript}"</p>}
            </div>
            {isOwnProfile && (
              <Button size="sm" variant="ghost" onClick={() => { setText(intro.transcript || ""); setEditing(true); }}>
                Edit
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-violet-500/20 border-2 border-dashed border-violet-400/40 flex items-center justify-center">
              <Mic className="h-5 w-5 text-violet-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-violet-200">Add a voice intro</p>
              <p className="text-xs text-muted-foreground">Greet visitors with an AI-generated audio message</p>
            </div>
            <Button size="sm" onClick={() => setEditing(true)} className="bg-violet-500 hover:bg-violet-600">
              Create
            </Button>
          </>
        )}
      </div>

      <AnimatePresence>
        {editing && isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-violet-400/20 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">Write your intro (max 500 chars)</p>
              <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hey! I'm Sarah, founder of UniqueApp. Welcome to my profile — let's connect!"
              maxLength={500}
              className="bg-background/50 border-violet-400/30 min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length} / 500</span>
              <Button onClick={generate} disabled={generating || !text.trim()} className="bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90">
                {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Mic className="h-4 w-4 mr-2" /> Generate voice</>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
};
