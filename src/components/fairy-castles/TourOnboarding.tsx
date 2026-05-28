import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, Volume2, MapPin } from "lucide-react";

export type TourGuideId = "princess" | "wizard" | "explorer";

interface TourOnboardingProps {
  castleName: string;
  castleCountry: string;
  funFacts: string[];
  totalRooms: number;
  isVisible: boolean;
  onStart: (guide: TourGuideId) => void;
}

const guides = [
  { id: "princess", emoji: "👸", name: "Princess", desc: "Elegant & detailed storytelling" },
  { id: "wizard", emoji: "🧙", name: "Wizard", desc: "Magical & mysterious guide" },
  { id: "explorer", emoji: "🗺️", name: "Explorer", desc: "Adventurous & fun facts" },
];

export function TourOnboarding({ castleName, castleCountry, funFacts, totalRooms, isVisible, onStart }: TourOnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedGuide, setSelectedGuide] = useState("explorer");

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl border border-border/50 p-8 max-w-md w-full shadow-2xl text-center"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                🏰
              </motion.div>
              <h2 className="text-2xl font-black mb-2">Welcome to</h2>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {castleName}
              </h3>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6">
                <MapPin className="h-4 w-4" /> {castleCountry}
              </div>

              {/* Fun fact teaser */}
              {funFacts[0] && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-6 text-left">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">Did you know?</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{funFacts[0]}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                <span>🏠 {totalRooms} rooms</span>
                <span>🎧 Audio guide</span>
                <span>🏆 Stamp reward</span>
              </div>

              <Button onClick={() => setStep(1)} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-5">
                <Compass className="mr-2 h-5 w-5" /> Prepare for Adventure!
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Volume2 className="h-10 w-10 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Choose Your Guide</h3>
              <p className="text-sm text-muted-foreground mb-6">Who will tell you the castle's stories?</p>

              <div className="space-y-3 mb-6">
                {guides.map(g => (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGuide(g.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      selectedGuide === g.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <span className="text-3xl">{g.emoji}</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <Button onClick={onStart} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-5">
                🚀 Start Tour!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
