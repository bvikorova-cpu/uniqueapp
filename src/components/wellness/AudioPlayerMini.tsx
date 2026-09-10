import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Props {
  src: string;
  fileName?: string;
}

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Minimal in-app audio player. Avoids the native browser controls
 * (whose overflow menu is rendered in the OS/browser language).
 */
export function AudioPlayerMini({ src, fileName = "meditation.mp3" }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDur(0);
  }, [src]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border/40 px-3 py-2">
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <Slider
          value={[dur ? (time / dur) * 100 : 0]}
          max={100}
          step={0.5}
          onValueChange={(v) => {
            const a = ref.current;
            if (a && dur) {
              a.currentTime = (v[0] / 100) * dur;
              setTime(a.currentTime);
            }
          }}
        />
      </div>

      <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
        {fmt(time)} / {fmt(dur)}
      </span>

      <a
        href={src}
        download={fileName}
        aria-label="Download"
        className="h-8 w-8 shrink-0 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Download className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export default AudioPlayerMini;
