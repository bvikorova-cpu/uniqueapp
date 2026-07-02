import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Loader2, ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ParallelLifeSimulatorProps {
  onBack: () => void;
}

interface SimDay {
  time: string;
  event: string;
  mood: string;
  choice?: { a: string; b: string };
}

const ParallelLifeSimulator = ({ onBack }: ParallelLifeSimulatorProps) => {
  const [scenario, setScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<{ title: string; days: SimDay[] } | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const { toast } = useToast();

  const handleSimulate = async () => {
    if (!scenario.trim()) { toast({ title: "Enter a scenario", variant: "destructive" }); return; }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke('multiverse-ai-tool', {
        body: { tool: 'parallel_life_simulator', scenario }
      });

      if (error) throw error;

      if (data?.simulation) {
        setSimulation(data.simulation);
        setCurrentDay(0);
      } else {
        // Fallback
        setSimulation({
          title: `Life as: ${scenario}`,
          days: [
            { time: "6:00 AM", event: "You wake up in a luxurious penthouse overlooking the city skyline. Your AI assistant briefs you on today's schedule.", mood: "Energized" },
            { time: "9:00 AM", event: "A critical meeting with international investors. Your alternate self handles it with surprising confidence.", mood: "Focused", choice: { a: "Push for aggressive expansion", b: "Propose a conservative growth strategy" } },
            { time: "12:30 PM", event: "Lunch at an exclusive rooftop restaurant. You run into an old friend who took a completely different path.", mood: "Reflective" },
            { time: "3:00 PM", event: "An unexpected crisis hits your project. How you handle it will define this reality's trajectory.", mood: "Stressed", choice: { a: "Take personal control of the situation", b: "Delegate to your trusted team" } },
            { time: "7:00 PM", event: "Evening gala event. Your alternate self's reputation opens doors you never imagined.", mood: "Excited" },
            { time: "11:00 PM", event: "Reflecting on the day, you realize this version of you has achieved incredible things, but at a cost.", mood: "Contemplative" },
          ]
        });
        setCurrentDay(0);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Simulation Failed", description: "Please try again", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const moodColors: Record<string, string> = {
    Energized: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
    Focused: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    Reflective: "text-violet-400 bg-violet-500/20 border-violet-500/30",
    Stressed: "text-red-400 bg-red-500/20 border-red-500/30",
    Excited: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    Contemplative: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
  };

  return (
    <>
      <FloatingHowItWorks
        title='Parallel Life Simulator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Parallel Life Simulator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-violet-300 hover:text-violet-100">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/30 to-black/70 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-fuchsia-200">
            <Gamepad2 className="w-6 h-6 text-fuchsia-400" />
            Parallel Life Simulator
          </CardTitle>
          <CardDescription className="text-violet-300/70">AI generates a day in the life of your alternate self — with interactive decision points</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            value={scenario} onChange={(e) => setScenario(e.target.value)} 
            placeholder="e.g., 'What if I became a famous musician?' or 'CEO of a tech startup'"
            className="bg-black/40 border-fuchsia-500/30 text-violet-100 placeholder:text-violet-400/40"
            onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
          />
          <Button onClick={handleSimulate} disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Simulation...</> : <><Sparkles className="w-4 h-4 mr-2" /> Simulate Parallel Day</>}
          </Button>
        </CardContent>
      </Card>

      {simulation && (
        <div className="space-y-4">
          <motion.h3 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xl font-black text-center bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent"
          >
            {simulation.title}
          </motion.h3>
          
          {simulation.days.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= currentDay ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1, type: "spring", damping: 15 }}
            >
              <Card className={`border-fuchsia-500/20 bg-black/50 backdrop-blur-xl overflow-hidden transition-all ${i <= currentDay ? '' : 'pointer-events-none'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-fuchsia-400">{day.time}</span>
                    <Badge className={`text-xs border ${moodColors[day.mood] || 'text-violet-400 bg-violet-500/20'}`}>{day.mood}</Badge>
                  </div>
                  <p className="text-sm text-violet-100/80">{day.event}</p>
                  {day.choice && i === currentDay && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/20"
                        onClick={() => setCurrentDay(prev => Math.min(prev + 1, simulation.days.length - 1))}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" /> {day.choice.a}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                        onClick={() => setCurrentDay(prev => Math.min(prev + 1, simulation.days.length - 1))}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" /> {day.choice.b}
                      </Button>
                    </div>
                  )}
                  {!day.choice && i === currentDay && i < simulation.days.length - 1 && (
                    <Button size="sm" variant="ghost" className="text-xs text-violet-400" onClick={() => setCurrentDay(prev => prev + 1)}>
                      Continue <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default ParallelLifeSimulator;
