import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wind, Timer, Check, Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const EXERCISES = [
  { id: "box", name: "Box Breathing", desc: "4-4-4-4 pattern for calm focus", inhale: 4, hold1: 4, exhale: 4, hold2: 4, color: "from-blue-500 to-cyan-500" },
  { id: "478", name: "4-7-8 Relaxation", desc: "Proven technique for deep relaxation", inhale: 4, hold1: 7, exhale: 8, hold2: 0, color: "from-purple-500 to-pink-500" },
  { id: "coherent", name: "Coherent Breathing", desc: "5.5 second rhythm for balance", inhale: 5.5, hold1: 0, exhale: 5.5, hold2: 0, color: "from-green-500 to-emerald-500" },
  { id: "energize", name: "Energizing Breath", desc: "Quick inhale, long exhale for energy", inhale: 2, hold1: 0, exhale: 6, hold2: 0, color: "from-orange-500 to-yellow-500" },
];

const DURATIONS = [3, 5, 10, 15, 20];

interface Props { onBack: () => void; }

export const BreathingMeditation = ({ onBack }: Props) => {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [duration, setDuration] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const intervalRef = useRef<any>(null);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("psychology_meditation_sessions")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (data) setSessions(data);
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold1": return "Hold";
      case "exhale": return "Breathe Out";
      case "hold2": return "Hold";
    }
  };

  const getPhaseDuration = () => {
    switch (phase) {
      case "inhale": return selectedExercise.inhale;
      case "hold1": return selectedExercise.hold1;
      case "exhale": return selectedExercise.exhale;
      case "hold2": return selectedExercise.hold2;
    }
  };

  const getNextPhase = (): "inhale" | "hold1" | "exhale" | "hold2" => {
    const phases: ("inhale" | "hold1" | "exhale" | "hold2")[] = ["inhale", "hold1", "exhale", "hold2"];
    const idx = phases.indexOf(phase);
    let next = (idx + 1) % 4;
    // Skip phases with 0 duration
    while (phases[next] && getExDuration(phases[next]) === 0) {
      next = (next + 1) % 4;
    }
    return phases[next];
  };

  const getExDuration = (p: string) => {
    switch (p) {
      case "inhale": return selectedExercise.inhale;
      case "hold1": return selectedExercise.hold1;
      case "exhale": return selectedExercise.exhale;
      case "hold2": return selectedExercise.hold2;
      default: return 0;
    }
  };

  useEffect(() => {
    if (!isActive) return;
    intervalRef.current = setInterval(() => {
      setPhaseTime(prev => {
        const phaseDur = getPhaseDuration();
        if (prev >= phaseDur) {
          setPhase(getNextPhase());
          return 0;
        }
        return prev + 0.1;
      });
      setTotalElapsed(prev => {
        if (prev >= duration * 60) {
          completeSession();
          return prev;
        }
        return prev + 0.1;
      });
    }, 100);
    return (
    <>
      <FloatingHowItWorks title={"Breathing Meditation - How it works"} steps={[{ title: 'Open', desc: 'Access the Breathing Meditation section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Breathing Meditation.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(intervalRef.current);
  }, [isActive, phase, selectedExercise, duration]);

  const completeSession = async () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await (supabase as any).from("psychology_meditation_sessions").insert({
        user_id: user.id, session_type: selectedExercise.id,
        duration_seconds: Math.floor(totalElapsed), completed: true,
      });
      toast.success(`Session complete! ${Math.floor(totalElapsed / 60)} minutes of mindfulness.`);
      loadSessions();
    } catch (e) { console.error(e); }
  };

  const toggleSession = () => {
    if (isActive) { setIsActive(false); clearInterval(intervalRef.current); }
    else { setIsActive(true); setPhase("inhale"); setPhaseTime(0); setTotalElapsed(0); }
  };

  const resetSession = () => {
    setIsActive(false); clearInterval(intervalRef.current);
    setPhase("inhale"); setPhaseTime(0); setTotalElapsed(0);
  };

  const progress = getPhaseDuration() > 0 ? phaseTime / getPhaseDuration() : 0;
  const totalProgress = totalElapsed / (duration * 60);
  const totalMinutes = Math.floor(sessions.reduce((s, e) => s + (e.duration_seconds || 0), 0) / 60);

  const circleScale = phase === "inhale" ? 1 + progress * 0.4 :
    phase === "exhale" ? 1.4 - progress * 0.4 : phase === "hold1" ? 1.4 : 1;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          Breathing & Meditation
        </h2>
        <p className="text-muted-foreground">Guided exercises to calm your mind and reduce stress.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{sessions.length}</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </Card>
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{totalMinutes}</p>
          <p className="text-xs text-muted-foreground">Total Minutes</p>
        </Card>
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{sessions.filter(s => {
            const d = new Date(s.created_at); const now = new Date();
            return d.toDateString() === now.toDateString();
          }).length}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </Card>
      </div>

      {!isActive ? (
        <>
          {/* Exercise Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXERCISES.map(ex => (
              <motion.div key={ex.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    selectedExercise.id === ex.id ? "ring-2 ring-primary bg-primary/10" : "bg-card/50 hover:bg-card/80"
                  }`}
                  onClick={() => setSelectedExercise(ex)}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${ex.color} flex items-center justify-center mb-2`}>
                    <Wind className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold">{ex.name}</h4>
                  <p className="text-xs text-muted-foreground">{ex.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Duration */}
          <Card className="p-4 bg-card/50 border-border/50">
            <p className="font-bold mb-3">Duration</p>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <Button key={d} variant={duration === d ? "default" : "outline"} size="sm" onClick={() => setDuration(d)}>
                  {d} min
                </Button>
              ))}
            </div>
          </Card>

          <Button onClick={toggleSession} size="lg" className="w-full gap-2">
            <Play className="h-5 w-5" /> Start {selectedExercise.name}
          </Button>
        </>
      ) : (
        /* Active Session */
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
          <div className="relative mx-auto w-48 h-48 mb-6 flex items-center justify-center">
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: 0.1, ease: "linear" }}
              className={`w-40 h-40 rounded-full bg-gradient-to-r ${selectedExercise.color} opacity-30`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-black text-foreground">{getPhaseLabel()}</p>
              <p className="text-sm text-muted-foreground">{Math.ceil(getPhaseDuration() - phaseTime)}s</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${totalProgress * 100}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.floor(totalElapsed / 60)}:{String(Math.floor(totalElapsed % 60)).padStart(2, "0")} / {duration}:00
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={toggleSession} variant="outline" className="gap-2">
              <Pause className="h-4 w-4" /> Pause
            </Button>
            <Button onClick={resetSession} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={completeSession} className="gap-2">
              <Check className="h-4 w-4" /> End Session
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
