import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Timer, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const meditations = [
  { id: "past-life", label: "Past Life Recall", duration: 300, description: "Guided meditation to access past life memories through deep relaxation and visualization." },
  { id: "karmic-release", label: "Karmic Release", duration: 600, description: "Release karmic blocks and negative patterns from past incarnations." },
  { id: "soul-connection", label: "Soul Connection", duration: 420, description: "Connect with your higher self and receive spiritual guidance." },
  { id: "chakra-alignment", label: "Chakra Alignment", duration: 480, description: "Align and balance your chakra system for spiritual clarity." },
  { id: "akashic-access", label: "Akashic Access", duration: 900, description: "Deep trance meditation to access the Akashic Records." },
  { id: "gratitude", label: "Gratitude & Forgiveness", duration: 360, description: "Practice gratitude and forgiveness to resolve karmic debts." },
];

export const MeditationChamber = () => {
  const { toast } = useToast();
  const [selectedMeditation, setSelectedMeditation] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadStats();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            completeMeditation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [isRunning]);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("activity_feed")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("activity_type", "reincarnation_meditation");

      setTotalSessions(count || 0);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const startMeditation = (id: string) => {
    const med = meditations.find((m) => m.id === id);
    if (!med) return;
    setSelectedMeditation(id);
    setTimeLeft(med.duration);
    setIsRunning(true);
  };

  const togglePause = () => setIsRunning(!isRunning);

  const reset = () => {
    setIsRunning(false);
    setSelectedMeditation(null);
    setTimeLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const completeMeditation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from("activity_feed").insert({
        user_id: session.user.id,
        activity_type: "reincarnation_meditation",
        target_type: selectedMeditation,
        metadata: { completed: true },
      });

      setTotalSessions((prev) => prev + 1);
      toast({ title: "Meditation Complete!", description: "Your soul thanks you for this practice." });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const activeMeditation = meditations.find((m) => m.id === selectedMeditation);

  return (
    <>
      <FloatingHowItWorks
        title='Meditation Chamber'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Meditation Chamber panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-black">Meditation Chamber</h3>
            <p className="text-sm text-muted-foreground">
              Guided spiritual meditations designed to unlock past life memories, 
              release karmic patterns, and deepen your connection to the soul realm.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">
            <Timer className="h-3 w-3 mr-1" />{totalSessions} sessions
          </Badge>
        </div>
      </Card>

      {selectedMeditation && activeMeditation ? (
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl border-primary/20">
          <div className="text-center space-y-6">
            <h3 className="font-black text-lg">{activeMeditation.label}</h3>
            <p className="text-sm text-muted-foreground">{activeMeditation.description}</p>

            {/* Timer circle */}
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" className="stroke-muted/20" strokeWidth="6" />
                <motion.circle
                  cx="60" cy="60" r="54" fill="none"
                  className="stroke-primary"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={339.292}
                  strokeDashoffset={339.292 * (1 - timeLeft / activeMeditation.duration)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={togglePause} variant="outline" size="lg">
                {isRunning ? <><Pause className="mr-2 h-4 w-4" />Pause</> : <><Play className="mr-2 h-4 w-4" />Resume</>}
              </Button>
              <Button onClick={reset} variant="ghost" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />Reset
              </Button>
            </div>

            {/* Breathing guide */}
            {isRunning && (
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mx-auto"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isRunning && <p className="text-xs text-muted-foreground">Breathe with the circle...</p>}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {meditations.map((med, i) => (
            <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 cursor-pointer transition-all"
                onClick={() => startMeditation(med.id)}
              >
                <h4 className="font-bold text-sm mb-1">{med.label}</h4>
                <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{med.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    <Timer className="h-3 w-3 mr-1" />{Math.floor(med.duration / 60)} min
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); startMeditation(med.id); }}>
                    <Play className="h-3 w-3 mr-1" />Start
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
