import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle2, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CHAKRAS, CRYSTAL_DATABASE } from "../crystalData";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const DAILY_CHAKRA_PROGRAM = CHAKRAS.map((chakra, i) => ({
  day: i + 1,
  chakra: chakra.name,
  color: chakra.color,
  frequency: chakra.frequency,
  crystals: CRYSTAL_DATABASE.filter(c => c.chakra.includes(chakra.name)).slice(0, 3).map(c => c.name),
  exercise: `Focus on your ${chakra.name} chakra at the ${chakra.location}. Meditate for 15 minutes with ${chakra.frequency} Hz frequency. Visualize ${chakra.color.toLowerCase()} light filling this energy center.`,
}));

export const CrystalChakraBalancingTool = () => {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programDate, setProgramDate] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => { fetchProgress(); }, []);

  const fetchProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await (supabase as any).from("crystal_chakra_progress").select("*").eq("user_id", session.user.id).order("program_started_at", { ascending: false }).limit(7);
    setProgress(data || []);
    if (data && data.length > 0) setProgramDate(data[0].program_started_at);
    setLoading(false);
  };

  const startProgram = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); return; }
    const today = new Date().toISOString().split("T")[0];
    const inserts = DAILY_CHAKRA_PROGRAM.map(day => ({
      user_id: session.user.id,
      day_number: day.day,
      chakra_name: day.chakra,
      completed: false,
      program_started_at: today,
    }));
    const { error } = await (supabase as any).from("crystal_chakra_progress").insert(inserts);
    if (error) toast.error("Failed to start program");
    else {
      toast.success("7-Day Chakra Balancing Program started! 🧘");
      setProgramDate(today);
      fetchProgress();
    }
  };

  const completeDay = async (dayNumber: number) => {
    if (!programDate) return;
    setCompleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await (supabase as any).from("crystal_chakra_progress")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("user_id", session.user.id)
      .eq("program_started_at", programDate)
      .eq("day_number", dayNumber);
    toast.success(`Day ${dayNumber} completed! ✨`);
    fetchProgress();
    setCompleting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const completedDays = progress.filter(p => p.completed).length;

  return (
    <>
      <FloatingHowItWorks title={"Crystal Chakra Balancing Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Chakra Balancing Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Chakra Balancing Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Heart className="w-5 h-5" /> Chakra Balancing Program
        </CardTitle>
        <p className="text-sm text-muted-foreground">7-day program to align all chakras</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center gap-1.5">
              {CHAKRAS.map(c => <div key={c.name} className="w-8 h-8 rounded-full" style={{ backgroundColor: c.color }} />)}
            </div>
            <h3 className="text-lg font-bold">Start Your Chakra Journey</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">A 7-day program with one chakra per day. Each day includes meditation, crystal recommendations, and exercises.</p>
            <Button onClick={startProgram} className="gap-2"><Play className="w-4 h-4" /> Begin 7-Day Program</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="text-sm font-semibold">{completedDays}/7 days completed</span>
              <div className="flex gap-1">
                {DAILY_CHAKRA_PROGRAM.map(day => {
                  const done = progress.find(p => p.day_number === day.day)?.completed;
                  return <div key={day.day} className={`w-5 h-5 rounded-full ${done ? "" : "opacity-30"}`} style={{ backgroundColor: day.color }} />;
                })}
              </div>
            </div>
            <div className="space-y-3">
              {DAILY_CHAKRA_PROGRAM.map(day => {
                const dayProgress = progress.find(p => p.day_number === day.day);
                const done = dayProgress?.completed;
                return (
                  <div key={day.day} className={`p-4 rounded-xl border transition-all ${done ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/30"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: day.color }}>
                          {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-xs text-white font-bold">{day.day}</span>}
                        </div>
                        <h4 className="font-bold text-sm">{day.chakra} Chakra</h4>
                      </div>
                      {!done && (
                        <Button size="sm" variant="outline" onClick={() => completeDay(day.day)} disabled={completing}>
                          Complete
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{day.exercise}</p>
                    <div className="flex gap-1 flex-wrap">
                      {day.crystals.map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{c}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};
