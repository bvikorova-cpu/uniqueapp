import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface AmbientSound {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

// Publicly hosted royalty-free ambient loops (Google Actions sound library — CC-BY).
const SOUNDS: AmbientSound[] = [
  { id: "rain", name: "Rain", emoji: "🌧️", url: "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" },
  { id: "crickets", name: "Crickets", emoji: "🦗", url: "https://actions.google.com/sounds/v1/ambiences/crickets_at_night.ogg" },
  { id: "ocean", name: "Ocean", emoji: "🌊", url: "https://actions.google.com/sounds/v1/water/ocean_waves.ogg" },
  { id: "wind", name: "Wind", emoji: "🍃", url: "https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg" },
  { id: "fireplace", name: "Fireplace", emoji: "🔥", url: "https://actions.google.com/sounds/v1/ambiences/fireplace.ogg" },
  { id: "birds", name: "Birds", emoji: "🐦", url: "https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg" },
];

export function AmbientSoundMixer() {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [volume, setVolume] = useState(60);
  const audiosRef = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    return () => {
      Object.values(audiosRef.current).forEach((a) => { try { a.pause(); } catch {} });
      audiosRef.current = {};
    };
  }, []);

  useEffect(() => {
    Object.values(audiosRef.current).forEach((a) => { a.volume = volume / 100; });
  }, [volume]);

  const toggleSound = async (s: AmbientSound) => {
    const isActive = !!active[s.id];
    if (isActive) {
      const a = audiosRef.current[s.id];
      if (a) { a.pause(); }
      setActive((prev) => ({ ...prev, [s.id]: false }));
      return;
    }
    let a = audiosRef.current[s.id];
    if (!a) {
      a = new Audio(s.url);
      a.loop = true;
      a.crossOrigin = "anonymous";
      a.preload = "auto";
      audiosRef.current[s.id] = a;
    }
    a.volume = volume / 100;
    try {
      await a.play();
      setActive((prev) => ({ ...prev, [s.id]: true }));
    } catch (err) {
      console.error("Ambient play failed", s.id, err);
    }
  };

  const activeCount = Object.values(active).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-purple-100 flex items-center gap-1.5">
          🎵 Ambient Sounds
        </h3>
        {activeCount > 0 && (
          <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SOUNDS.map((sound) => {
          const isOn = !!active[sound.id];
          return (
            <motion.div key={sound.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => toggleSound(sound)}
                className={`w-full h-auto py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${
                  isOn
                    ? "bg-purple-500/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <motion.span
                  className="text-xl"
                  animate={isOn ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {sound.emoji}
                </motion.span>
                <span className={`text-[10px] font-medium ${isOn ? "text-purple-200" : "text-gray-400"}`}>
                  {sound.name}
                </span>
                {isOn && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex gap-0.5 mt-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-purple-300 rounded-full"
                        animate={{ height: [4, 10, 4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </motion.div>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {activeCount > 0 && (
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-purple-200 text-[11px] font-semibold flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Ambient volume
            </label>
            <span className="text-purple-300 text-[10px]">{volume}%</span>
          </div>
          <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} step={1} />
        </div>
      )}
    </div>
  );
}
