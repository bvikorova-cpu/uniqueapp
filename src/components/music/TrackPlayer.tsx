import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  trackId: string;
  audioUrl: string;
  title?: string;
}

/** Audio player that records a stream after >= 5s of playback. */
export const TrackPlayer = ({ trackId, audioUrl, title }: Props) => {
  const ref = useRef<HTMLAudioElement>(null);
  const startRef = useRef<number | null>(null);
  const recordedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPlay = () => { startRef.current = Date.now(); setPlaying(true); };
    const onPause = async () => {
      setPlaying(false);
      if (recordedRef.current || !startRef.current) return;
      const ms = Date.now() - startRef.current;
      if (ms >= 5000) {
        recordedRef.current = true;
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("music_streams" as any).insert({
          track_id: trackId,
          listener_id: user?.id ?? null,
          duration_ms: ms,
        });
      }
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onPause);
    };
  }, [trackId]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) el.pause(); else void el.play();
  };

  return (
    <>
      <FloatingHowItWorks title="How Track Player works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
      <Button size="icon" variant="ghost" onClick={toggle}>
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </Button>
      {title && <div className="flex-1 font-medium truncate">{title}</div>}
      <audio ref={ref} src={audioUrl} preload="none" />
    </div>
    </>
    );
};
