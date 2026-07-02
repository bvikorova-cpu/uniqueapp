import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  text: string;
  onWordClick?: (word: string) => void;
}

/**
 * Browser-based AI Read-Aloud (Web Speech Synthesis) — FREE, no credits.
 * Highlights the active word and supports tap-to-define.
 */
export const ReadAloudPlayer = ({ text, onWordClick }: Props) => {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const words = useMemo(() => text.split(/(\s+)/), [text]);

  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis?.getVoices() ?? [];
      setVoices(v);
      if (!voiceURI && v.length) {
        const pref = v.find(x => /en|sk|cs/i.test(x.lang)) ?? v[0];
        setVoiceURI(pref.voiceURI);
      }
    };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", load);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stop = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false); setPaused(false); setActiveIdx(null);
  };

  const play = () => {
    if (!text.trim() || !("speechSynthesis" in window)) return;
    stop();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    const v = voices.find(x => x.voiceURI === voiceURI);
    if (v) u.voice = v;
    u.onstart = () => { setPlaying(true); setPaused(false); };
    u.onend = () => { setPlaying(false); setActiveIdx(null); };
    u.onboundary = (e) => {
      if (e.name !== "word") return;
      const charIdx = e.charIndex;
      let cum = 0;
      for (let i = 0; i < words.length; i++) {
        cum += words[i].length;
        if (charIdx < cum) { setActiveIdx(i); break; }
      }
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const togglePause = () => {
    if (!playing) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };

  if (!text.trim()) return null;

  return (
    <Card className="border-primary/20">
      <CardContent className="py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={playing ? togglePause : play}>
            {playing && !paused ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {playing ? (paused ? "Resume" : "Pause") : "Read aloud"}
          </Button>
          {playing && (
            <Button size="sm" variant="outline" onClick={stop}>
              <Square className="w-4 h-4 mr-1" /> Stop
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto text-xs">
            <Volume2 className="w-3 h-3" />
            <span>Speed</span>
            <div className="w-24">
              <Slider value={[rate]} min={0.5} max={1.5} step={0.1} onValueChange={([v]) => setRate(v)} />
            </div>
            <span className="tabular-nums">{rate.toFixed(1)}x</span>
          </div>
        </div>

        {voices.length > 1 && (
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            className="text-xs bg-background border rounded px-2 py-1 w-full"
          >
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
            ))}
          </select>
        )}

        <div className="text-sm leading-relaxed p-3 rounded-lg bg-muted/40 max-h-64 overflow-auto">
          {words.map((w, i) => {
            const isWord = /\S/.test(w);
            const clean = w.replace(/[^\p{L}\p{N}'-]/gu, "");
            return (
              <span
                key={i}
                onClick={() => isWord && clean && onWordClick?.(clean)}
                className={[
                  isWord ? "cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors" : "",
                  activeIdx === i ? "bg-primary/30 font-semibold" : "",
                ].join(" ")}
              >
                {w}
              </span>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground">
          💡 Tap any word to get a kid-friendly definition (1 credit).
        </p>
      </CardContent>
    </Card>
  );
};
