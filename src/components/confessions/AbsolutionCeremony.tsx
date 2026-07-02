import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Heart, Shield, Clock, Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ceremonies = [
  {
    id: "release",
    title: "Burden Release",
    duration: 180,
    description: "A guided meditation to release guilt and emotional weight.",
    steps: [
      { time: 0, instruction: "Close your eyes. Take three deep breaths.", duration: 20 },
      { time: 20, instruction: "Visualize a heavy stone in your hands. This stone represents your burdens.", duration: 30 },
      { time: 50, instruction: "Feel the weight of this stone. Acknowledge the guilt without judgment.", duration: 30 },
      { time: 80, instruction: "Now, slowly open your hands. Allow the stone to dissolve into light.", duration: 30 },
      { time: 110, instruction: "Feel the lightness in your hands. The burden is lifting.", duration: 30 },
      { time: 140, instruction: "Breathe deeply. You are forgiven. You are free.", duration: 20 },
      { time: 160, instruction: "When you're ready, open your eyes. Carry this peace with you.", duration: 20 },
    ],
  },
  {
    id: "forgiveness",
    title: "Self-Forgiveness Ritual",
    duration: 240,
    description: "A ceremony focused on forgiving yourself and finding inner peace.",
    steps: [
      { time: 0, instruction: "Sit comfortably. Place your hand over your heart.", duration: 20 },
      { time: 20, instruction: "Feel your heartbeat. You are alive. You are worthy of love.", duration: 30 },
      { time: 50, instruction: "Think of the action that causes you guilt. See it clearly.", duration: 30 },
      { time: 80, instruction: "Now say to yourself: 'I made a mistake. I am human. I forgive myself.'", duration: 40 },
      { time: 120, instruction: "Imagine warm golden light flowing from your heart, healing the wound.", duration: 40 },
      { time: 160, instruction: "The light grows brighter. Every part of you is bathed in forgiveness.", duration: 40 },
      { time: 200, instruction: "Take a deep breath. You are renewed. You are at peace.", duration: 20 },
      { time: 220, instruction: "Open your eyes gently. Carry this forgiveness forward.", duration: 20 },
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude Absolution",
    duration: 150,
    description: "Transform guilt into gratitude through a guided practice.",
    steps: [
      { time: 0, instruction: "Close your eyes. Breathe slowly and deeply.", duration: 20 },
      { time: 20, instruction: "Think of three things you are grateful for today.", duration: 30 },
      { time: 50, instruction: "For each blessing, whisper 'Thank you' with genuine feeling.", duration: 30 },
      { time: 80, instruction: "Now, think of the lesson your mistake has taught you.", duration: 30 },
      { time: 110, instruction: "Be grateful for this lesson. It has made you wiser.", duration: 20 },
      { time: 130, instruction: "Open your eyes. You are absolved through gratitude.", duration: 20 },
    ],
  },
];

export const AbsolutionCeremony = () => {
  const { toast } = useToast();
  const [selectedCeremony, setSelectedCeremony] = useState<typeof ceremonies[0] | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startCeremony = (ceremony: typeof ceremonies[0]) => {
    setSelectedCeremony(ceremony);
    setIsActive(true);
    setElapsed(0);

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= ceremony.duration) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsActive(false);
          setCompleted(c => [...c, ceremony.id]);

          // Save completion
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase.from("ai_generated_content").insert({
                user_id: user.id,
                content_type: "blog_article" as any,
                title: `Ceremony: ${ceremony.title}`,
                prompt: "ceremony_completion",
                generated_text: `Completed the ${ceremony.title} absolution ceremony. Duration: ${Math.round(ceremony.duration / 60)} minutes.`,
                metadata: { type: "ceremony_completion", ceremony_id: ceremony.id },
              });
            }
          });

          toast({ title: "Ceremony Complete!", description: `You have completed the ${ceremony.title}.` });
          return ceremony.duration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pauseResume = () => {
    if (isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
    } else if (selectedCeremony) {
      setIsActive(true);
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= selectedCeremony.duration) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
            return selectedCeremony.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const resetCeremony = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setElapsed(0);
    setSelectedCeremony(null);
  };

  const getCurrentInstruction = () => {
    if (!selectedCeremony) return "";
    const current = [...selectedCeremony.steps].reverse().find(s => elapsed >= s.time);
    return current?.instruction || "";
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      <FloatingHowItWorks
        title='Absolution Ceremony'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Absolution Ceremony panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Absolution Ceremony</h3>
        <p className="text-sm text-muted-foreground">
          Guided spiritual rituals for emotional cleansing and absolution. Each ceremony includes
          timed meditative steps to help you release guilt and find inner peace.
        </p>
      </Card>

      {/* Active Ceremony */}
      {selectedCeremony && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-3 text-[10px]">
                {isActive ? "IN PROGRESS" : elapsed >= selectedCeremony.duration ? "COMPLETE" : "PAUSED"}
              </Badge>
              <h4 className="font-black text-xl mb-1">{selectedCeremony.title}</h4>
              <p className="text-3xl font-black text-primary">
                {formatTime(elapsed)} / {formatTime(selectedCeremony.duration)}
              </p>
            </div>

            <Progress value={(elapsed / selectedCeremony.duration) * 100} className="h-2 mb-6" />

            {/* Current Instruction */}
            <AnimatePresence mode="wait">
              <motion.div
                key={getCurrentInstruction()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center p-6 rounded-xl bg-card/50 border border-border/30 mb-6"
              >
                <Sparkles className="h-6 w-6 mx-auto text-primary mb-3" />
                <p className="text-sm font-medium leading-relaxed">{getCurrentInstruction()}</p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <Button size="icon" variant="outline" onClick={resetCeremony} className="h-12 w-12 rounded-full">
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button size="icon" onClick={pauseResume} className="h-14 w-14 rounded-full" disabled={elapsed >= selectedCeremony.duration}>
                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Ceremony Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ceremonies.map((ceremony, i) => (
          <motion.div key={ceremony.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-5 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all cursor-pointer ${
              completed.includes(ceremony.id) ? "border-emerald-500/30" : ""
            }`} onClick={() => { if (!isActive) startCeremony(ceremony); }}>
              <div className="flex items-center gap-2 mb-2">
                {completed.includes(ceremony.id) ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                <h4 className="font-bold text-sm">{ceremony.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{ceremony.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  <Clock className="h-2.5 w-2.5 mr-1" />{Math.round(ceremony.duration / 60)} min
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {ceremony.steps.length} steps
                </Badge>
                {completed.includes(ceremony.id) && (
                  <Badge className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Done</Badge>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
