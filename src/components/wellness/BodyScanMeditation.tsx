import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Sparkles, Heart, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useWellnessProgress } from "@/hooks/useWellnessProgress";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface BodyPart {
  id: string;
  name: string;
  nameEn: string;
  duration: number;
  instructions: string;
  color: string;
}

const bodyParts: BodyPart[] = [
  { id: "head", name: "Head & Face", nameEn: "head", duration: 30, instructions: "Focus on your head and face. Release tension in your forehead, around your eyes, and jaw.", color: "from-violet-500/40 to-purple-500/40" },
  { id: "neck", name: "Neck & Shoulders", nameEn: "neck", duration: 30, instructions: "Notice your neck and shoulders. Let the tension flow away from this area.", color: "from-blue-500/40 to-cyan-500/40" },
  { id: "arms", name: "Arms & Hands", nameEn: "arms", duration: 30, instructions: "Move your attention through your shoulders, elbows, down to your fingertips.", color: "from-sky-500/40 to-blue-500/40" },
  { id: "chest", name: "Chest & Abdomen", nameEn: "chest", duration: 30, instructions: "Notice your breathing in your chest and abdomen. Each breath calms you.", color: "from-emerald-500/40 to-green-500/40" },
  { id: "back", name: "Back", nameEn: "back", duration: 30, instructions: "Move your attention along your entire spine. Release tension in your lower back.", color: "from-teal-500/40 to-emerald-500/40" },
  { id: "legs", name: "Legs", nameEn: "legs", duration: 30, instructions: "Notice your thighs, knees, and calves. Feel them relaxing.", color: "from-amber-500/40 to-yellow-500/40" },
  { id: "feet", name: "Feet", nameEn: "feet", duration: 30, instructions: "Finally, focus on your feet and toes. Feel your connection to the ground.", color: "from-orange-500/40 to-rose-500/40" },
];

export function BodyScanMeditation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(bodyParts[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [completedParts, setCompletedParts] = useState<Set<number>>(new Set());
  const intervalRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { logSession, updateStats } = useWellnessProgress();

  const currentPart = bodyParts[currentPartIndex];
  const totalDuration = bodyParts.reduce((acc, part) => acc + part.duration, 0);
  const progress = (totalElapsed / totalDuration) * 100;
  const isComplete = completedParts.size === bodyParts.length;

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startMeditation = () => {
    setIsPlaying(true);
    setSessionStartTime(Date.now());
    speak(currentPart.instructions);
    updateStats({ activityType: "body_scan" }).catch(console.error);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setCurrentPartIndex(0);
    setTimeLeft(bodyParts[0].duration);
    setTotalElapsed(0);
    setCompletedParts(new Set());
    window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCompletedParts(cp => new Set([...cp, currentPartIndex]));
            const nextIndex = currentPartIndex + 1;
            if (nextIndex < bodyParts.length) {
              setCurrentPartIndex(nextIndex);
              speak(bodyParts[nextIndex].instructions);
              return bodyParts[nextIndex].duration;
            } else {
              setIsPlaying(false);
              speak("Body scan meditation is complete. Slowly open your eyes and return to the present moment.");
              const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
              logSession({ sessionType: "body_scan", durationSeconds, completed: true }).catch(console.error);
              return 0;
            }
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentPartIndex]);

  const getBodyPartClass = (partName: string) => {
    const isActive = currentPart.nameEn === partName;
    const partIndex = bodyParts.findIndex(p => p.nameEn === partName);
    const isDone = completedParts.has(partIndex);
    if (isActive && isPlaying) return "fill-primary/60 stroke-primary animate-pulse";
    if (isActive) return "fill-primary/40 stroke-primary";
    if (isDone) return "fill-green-500/30 stroke-green-500/60";
    return "fill-muted/40 stroke-muted-foreground/20";
  };

  return (
    <div className="space-y-6 mt-4">
      <FloatingHowItWorks title="BodyScanMeditation — How it works" steps={[{title:"Open this tool",desc:"Access BodyScanMeditation within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-primary/5 to-emerald-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            Body Scan Meditation
            {isPlaying && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] animate-pulse">
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Progressively focus on each body part and release tension with audio guidance</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Body Visualization */}
            <div className="flex flex-col items-center">
              <div className="relative mx-auto w-full max-w-[280px] aspect-[3/4]">
                {/* Glow effect behind active part */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-20"
                    style={{ background: `radial-gradient(circle at 50% ${(currentPartIndex / bodyParts.length) * 100}%, hsl(var(--primary)), transparent 60%)` }}
                    animate={{ opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="100" cy="30" rx="20" ry="25" className={`transition-all duration-700 ${getBodyPartClass("head")}`} strokeWidth="2" />
                  <rect x="90" y="50" width="20" height="15" rx="4" className={`transition-all duration-700 ${getBodyPartClass("neck")}`} strokeWidth="2" />
                  <ellipse cx="100" cy="95" rx="35" ry="40" className={`transition-all duration-700 ${getBodyPartClass("chest")}`} strokeWidth="2" />
                  <ellipse cx="60" cy="95" rx="12" ry="50" className={`transition-all duration-700 ${getBodyPartClass("arms")}`} strokeWidth="2" />
                  <ellipse cx="140" cy="95" rx="12" ry="50" className={`transition-all duration-700 ${getBodyPartClass("arms")}`} strokeWidth="2" />
                  <ellipse cx="100" cy="110" rx="30" ry="35" className={`transition-all duration-700 ${currentPart.nameEn === "back" ? "fill-primary/40 stroke-primary" : "fill-transparent stroke-muted-foreground/10"}`} strokeWidth="2" strokeDasharray="5,5" />
                  <ellipse cx="80" cy="190" rx="15" ry="70" className={`transition-all duration-700 ${getBodyPartClass("legs")}`} strokeWidth="2" />
                  <ellipse cx="120" cy="190" rx="15" ry="70" className={`transition-all duration-700 ${getBodyPartClass("legs")}`} strokeWidth="2" />
                  <ellipse cx="75" cy="270" rx="18" ry="12" className={`transition-all duration-700 ${getBodyPartClass("feet")}`} strokeWidth="2" />
                  <ellipse cx="125" cy="270" rx="18" ry="12" className={`transition-all duration-700 ${getBodyPartClass("feet")}`} strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Right side: Info + Controls */}
            <div className="flex flex-col justify-center space-y-5">
              {/* Current Part Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPartIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-center md:text-left"
                >
                  <Badge variant="outline" className="mb-2 text-xs">Part {currentPartIndex + 1} of {bodyParts.length}</Badge>
                  <h3 className="text-xl font-bold mb-2">{currentPart.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{currentPart.instructions}</p>
                </motion.div>
              </AnimatePresence>

              {/* Timer */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <motion.div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentPart.color} flex items-center justify-center border border-white/10 shadow-xl`}
                  animate={isPlaying ? { boxShadow: ["0 0 20px rgba(var(--primary-rgb), 0.2)", "0 0 40px rgba(var(--primary-rgb), 0.4)", "0 0 20px rgba(var(--primary-rgb), 0.2)"] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-2xl font-black text-foreground">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </motion.div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Total Progress</p>
                  <p className="text-lg font-bold">{Math.round(progress)}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-center md:justify-start">
                <Button
                  onClick={isPlaying ? pauseMeditation : startMeditation}
                  size="lg"
                  className="gap-2 shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform"
                  disabled={isComplete}
                >
                  {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> {currentPartIndex === 0 && totalElapsed === 0 ? "Start" : "Continue"}</>}
                </Button>
                <Button onClick={resetMeditation} variant="outline" size="lg" className="gap-2 active:scale-[0.97] transition-transform">
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body Parts Timeline */}
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Scan Sequence
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2">
            {bodyParts.map((part, index) => {
              const isActive = index === currentPartIndex;
              const isDone = completedParts.has(index);
              return (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    isActive
                      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                      : isDone
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-border/30 bg-card/40"
                  } ${index > currentPartIndex && !isDone ? "opacity-50" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDone ? "bg-green-500/20" : isActive ? "bg-primary/20" : "bg-muted/30"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{part.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{part.duration}s</span>
                  {isActive && isPlaying && (
                    <div className="flex items-center gap-0.5">
                      {[3, 4, 3, 5, 3].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 rounded-full bg-primary"
                          animate={{ height: [h, h * 2, h] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completion celebration */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="relative overflow-hidden border-green-500/30 backdrop-blur-xl bg-card/80">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
            <CardContent className="relative pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-black mb-2">Session Complete!</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                You've completed the full body scan. Notice how your body feels — lighter, more relaxed, and at ease.
              </p>
              <Button onClick={resetMeditation} className="gap-2 active:scale-[0.97] transition-transform">
                <RotateCcw className="w-4 h-4" /> Start New Session
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
