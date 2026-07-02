import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface AmbientSound {
  id: string;
  name: string;
  emoji: string;
  active: boolean;
}

export function AmbientSoundMixer() {
  const [sounds, setSounds] = useState<AmbientSound[]>([
    { id: "rain", name: "Rain", emoji: "🌧️", active: false },
    { id: "crickets", name: "Crickets", emoji: "🦗", active: false },
    { id: "ocean", name: "Ocean", emoji: "🌊", active: false },
    { id: "wind", name: "Wind", emoji: "🍃", active: false },
    { id: "fireplace", name: "Fireplace", emoji: "🔥", active: false },
    { id: "birds", name: "Birds", emoji: "🐦", active: false },
  ]);

  const toggleSound = (id: string) => {
    setSounds(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const activeCount = sounds.filter(s => s.active).length;

  return (
    <>
      <FloatingHowItWorks title={"Ambient Sound Mixer - How it works"} steps={[{ title: 'Open', desc: 'Access the Ambient Sound Mixer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Ambient Sound Mixer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
        {sounds.map((sound) => (
          <motion.div key={sound.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={() => toggleSound(sound.id)}
              className={`w-full h-auto py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${
                sound.active
                  ? "bg-purple-500/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <motion.span
                className="text-xl"
                animate={sound.active ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {sound.emoji}
              </motion.span>
              <span className={`text-[10px] font-medium ${sound.active ? "text-purple-200" : "text-gray-400"}`}>
                {sound.name}
              </span>

              {/* Active indicator */}
              {sound.active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex gap-0.5 mt-0.5"
                >
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
        ))}
      </div>
    </div>
    </>
  );
}
