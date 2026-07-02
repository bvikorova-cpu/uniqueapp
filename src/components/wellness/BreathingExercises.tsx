import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Wind, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Exercise = {
  name: string;
  description: string;
  phases: { name: string; duration: number; color: string }[];
};

const EXERCISES: Record<string, Exercise> = {
  "4-7-8": {
    name: "4-7-8 Breathing",
    description: "A calming technique developed by Dr. Andrew Weil to reduce anxiety and promote restful sleep.",
    phases: [
      { name: "Inhale", duration: 4, color: "from-sky-500/40 to-cyan-500/40" },
      { name: "Hold", duration: 7, color: "from-violet-500/40 to-purple-500/40" },
      { name: "Exhale", duration: 8, color: "from-emerald-500/40 to-green-500/40" },
    ],
  },
  box: {
    name: "Box Breathing",
    description: "Used by Navy SEALs for focus under pressure. Equal breathing pattern for stress relief.",
    phases: [
      { name: "Inhale", duration: 4, color: "from-sky-500/40 to-cyan-500/40" },
      { name: "Hold", duration: 4, color: "from-violet-500/40 to-purple-500/40" },
      { name: "Exhale", duration: 4, color: "from-emerald-500/40 to-green-500/40" },
      { name: "Hold", duration: 4, color: "from-amber-500/40 to-yellow-500/40" },
    ],
  },
  "2-4": {
    name: "Relaxing Breath",
    description: "Simple 2-second inhale, 4-second exhale pattern. Perfect for beginners.",
    phases: [
      { name: "Inhale", duration: 2, color: "from-sky-500/40 to-cyan-500/40" },
      { name: "Exhale", duration: 4, color: "from-emerald-500/40 to-green-500/40" },
    ],
  },
};

export function BreathingExercises() {
  const [selectedExercise, setSelectedExercise] = useState<string>("4-7-8");
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [scale, setScale] = useState(1);

  const exercise = EXERCISES[selectedExercise];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      const nextPhase = (currentPhase + 1) % exercise.phases.length;
      if (nextPhase === 0) setCycleCount(c => c + 1);
      setCurrentPhase(nextPhase);
      setTimeLeft(exercise.phases[nextPhase].duration);
    }
  }, [isActive, timeLeft, currentPhase, exercise.phases]);

  useEffect(() => {
    const phase = exercise.phases[currentPhase];
    if (phase.name.toLowerCase().includes("inhale")) setScale(1.6);
    else if (phase.name.toLowerCase().includes("exhale")) setScale(0.6);
    else setScale(1.1);
  }, [currentPhase, exercise.phases]);

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(exercise.phases[0].duration);
    setCurrentPhase(0);
    setCycleCount(0);
  };

  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setTimeLeft(0);
    setScale(1);
    setCycleCount(0);
  };

  const phaseColor = exercise.phases[currentPhase]?.color || "from-primary/40 to-primary/20";

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="BreathingExercises — How it works" steps={[{title:"Open this tool",desc:"Access BreathingExercises within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-primary/5 to-emerald-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10">
            <Wind className="w-5 h-5 text-sky-400" />
          </div>
          Breathing Exercises
        </CardTitle>
        <CardDescription>Follow the visual guide and breathe in sync with the circle</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Tabs value={selectedExercise} onValueChange={(v) => { setSelectedExercise(v); handleReset(); }}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="4-7-8">4-7-8</TabsTrigger>
            <TabsTrigger value="box">Box</TabsTrigger>
            <TabsTrigger value="2-4">Relaxing</TabsTrigger>
          </TabsList>

          {Object.entries(EXERCISES).map(([key, ex]) => (
            <TabsContent key={key} value={key}>
              <p className="text-sm text-muted-foreground mb-2 text-center">{ex.description}</p>
              
              {/* Phase indicators */}
              <div className="flex justify-center gap-2 mb-6">
                {ex.phases.map((p, i) => (
                  <Badge key={i} variant={isActive && currentPhase === i ? "default" : "outline"} className="text-xs transition-all">
                    {p.name} ({p.duration}s)
                  </Badge>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6">
                {/* Breathing circle with pulse rings */}
                <div className="relative flex items-center justify-center w-56 h-56">
                  {/* Outer pulse rings */}
                  {isActive && (
                    <>
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseColor} opacity-20`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className={`absolute inset-4 rounded-full bg-gradient-to-br ${phaseColor} opacity-15`}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      />
                    </>
                  )}

                  {/* Main breathing circle */}
                  <motion.div
                    className={`w-48 h-48 rounded-full bg-gradient-to-br ${phaseColor} backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl`}
                    animate={{ scale: isActive ? scale : 1 }}
                    transition={{ duration: exercise.phases[currentPhase]?.duration || 4, ease: "easeInOut" }}
                  >
                    <div className="text-center">
                      <motion.div
                        key={timeLeft}
                        initial={{ scale: 1.2, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-black text-foreground"
                      >
                        {timeLeft || exercise.phases[0].duration}
                      </motion.div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isActive ? exercise.phases[currentPhase].name : "ready"}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-sm font-semibold text-muted-foreground mt-1"
                        >
                          {isActive ? exercise.phases[currentPhase].name : "Ready"}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Cycle counter */}
                {cycleCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {cycleCount} cycle{cycleCount > 1 ? 's' : ''} completed
                  </Badge>
                )}

                <div className="flex gap-3">
                  {!isActive ? (
                    <Button onClick={handleStart} size="lg" className="gap-2 shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform">
                      <Play className="w-4 h-4" /> Start
                    </Button>
                  ) : (
                    <Button onClick={handlePause} variant="secondary" size="lg" className="gap-2 active:scale-[0.97] transition-transform">
                      <Pause className="w-4 h-4" /> Pause
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 active:scale-[0.97] transition-transform">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
