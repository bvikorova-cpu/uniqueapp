import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, Pause, ChevronRight, Shield, Heart, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SCENARIOS = [
  { id: "spider", name: "Arachnophobia", emoji: "🕷️", levels: 5, description: "Gradually face your fear of spiders" },
  { id: "heights", name: "Acrophobia", emoji: "🏔️", levels: 5, description: "Overcome fear of heights step by step" },
  { id: "social", name: "Social Anxiety", emoji: "👥", levels: 5, description: "Build confidence in social situations" },
  { id: "flying", name: "Aviophobia", emoji: "✈️", levels: 5, description: "Conquer your fear of flying" },
  { id: "enclosed", name: "Claustrophobia", emoji: "🚪", levels: 5, description: "Manage fear of enclosed spaces" },
  { id: "dark", name: "Nyctophobia", emoji: "🌙", levels: 5, description: "Face your fear of darkness" },
];

const LEVEL_DESCRIPTIONS: Record<string, string[]> = {
  spider: ["Look at a cartoon spider drawing", "View a distant photo of a small spider", "Watch a video of a spider in nature", "Examine a close-up photo of a spider", "Imagine holding a spider in your hand"],
  heights: ["Stand on a small step stool", "Look out a second-floor window", "Stand on a balcony of a 5th floor", "Walk across a glass bridge", "Look down from a skyscraper observation deck"],
  social: ["Wave to a neighbor", "Order food at a restaurant", "Start a conversation with a stranger", "Give a presentation to 5 people", "Speak in front of a large audience"],
  flying: ["Watch planes take off from ground", "Sit in a parked airplane", "Taxi on the runway", "Take a short 30-minute flight", "Complete a long international flight"],
  enclosed: ["Stand in a large closet with door open", "Ride a spacious elevator alone", "Sit in a small room for 5 minutes", "Ride a crowded elevator", "Enter a small crawl space"],
  dark: ["Dim the lights slightly", "Sit in a room with only candlelight", "Walk outside at dusk", "Sit in complete darkness for 1 minute", "Spend 10 minutes in total darkness"],
};

export const ExposureSimulator = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const startExposure = (id: string) => {
    setSelectedScenario(id);
    setCurrentLevel(0);
    setIsActive(false);
    setTimer(0);
  };

  const beginLevel = () => {
    setIsActive(true);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          toast.success(`Level ${currentLevel + 1} completed! Great job!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextLevel = () => {
    if (!selectedScenario) return;
    if (currentLevel >= 4) {
      setCompleted(prev => new Set(prev).add(selectedScenario));
      toast.success("🎉 Scenario completed! You're making incredible progress!");
      setSelectedScenario(null);
      return;
    }
    setCurrentLevel(prev => prev + 1);
    setTimer(0);
  };

  if (selectedScenario) {
    const scenario = SCENARIOS.find(s => s.id === selectedScenario)!;
    const levels = LEVEL_DESCRIPTIONS[selectedScenario] || [];

    return (
    <>
      <FloatingHowItWorks title={"Exposure Simulator - How it works"} steps={[{ title: 'Open', desc: 'Access the Exposure Simulator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Exposure Simulator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(null)}>← Back to Scenarios</Button>
        
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">{scenario.emoji}</span>
            <h3 className="font-black text-xl">{scenario.name}</h3>
            <p className="text-sm text-muted-foreground">Level {currentLevel + 1} of 5</p>
          </div>

          <div className="flex gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i <= currentLevel ? "bg-cyan-500" : "bg-muted/30"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentLevel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-4 bg-muted/10 border-border/30 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-bold">Exposure Task</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    Level {currentLevel + 1}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{levels[currentLevel]}</p>
              </Card>
            </motion.div>
          </AnimatePresence>

          {isActive ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Timer className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-black text-cyan-400">{timer}s</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                <span>Breathe deeply... You're safe.</span>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                <Shield className="h-3 w-3 inline mr-1" />
                Remember: You can stop at any time. This is a safe space.
              </div>
            </div>
          ) : timer === 0 && currentLevel === 0 && !isActive ? (
            <Button onClick={beginLevel} className="w-full">
              <Play className="h-4 w-4 mr-2" /> Begin Exposure
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button onClick={beginLevel} variant="outline" className="flex-1">
                <Play className="h-4 w-4 mr-2" /> Retry Level
              </Button>
              <Button onClick={nextLevel} className="flex-1">
                <ChevronRight className="h-4 w-4 mr-2" />
                {currentLevel >= 4 ? "Complete!" : "Next Level"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="font-bold">Guided Exposure Therapy</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Gradually face your fears in a safe, controlled environment. Each scenario has 5 levels of increasing intensity.
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCENARIOS.map(s => (
          <Card key={s.id} className="p-4 bg-card/80 backdrop-blur-xl border-border/50 cursor-pointer hover:border-cyan-500/30 transition-colors"
            onClick={() => startExposure(s.id)}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{s.name}</h4>
                  {completed.has(s.id) && <Badge className="bg-green-500/20 text-green-500 text-[9px]">✓ Done</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground">{s.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
