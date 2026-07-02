import { useRef, useState } from "react";
import { Music2, Pause, Play } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ProfileMusicPlayer = ({
  url,
  title,
}: {
  url?: string | null;
  title?: string | null;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!url) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play().catch(() => {}); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Profile Music Player - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Music Player section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Music Player.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-3 mb-6 flex items-center gap-3">
      <button
        onClick={toggle}
        className="h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/30 grid place-items-center transition"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Music2 className="h-3 w-3" />
          Profile track
        </div>
        <div className="text-sm font-medium truncate">{title || "Untitled"}</div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
    </div>
    </>
  );
};
