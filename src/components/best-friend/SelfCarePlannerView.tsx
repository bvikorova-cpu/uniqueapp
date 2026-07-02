import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Leaf, Loader2, Sparkles, CheckCircle2, Heart, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const SelfCarePlannerView = () => {
  const [needs, setNeeds] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "self_care_planner", needs: needs || undefined, timeAvailable: timeAvailable || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Self-care plan ready! 🌿 (3 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Self Care Planner View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Self-Care Planner
          </h2>
          <p className="text-muted-foreground mt-2">Personalized wellness routines designed just for you</p>
          <Badge variant="outline" className="mt-2">3 Credits per plan</Badge>
        </div>
      </motion.div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
          <CardHeader><CardTitle className="text-lg">Tell us about your needs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">What do you need help with? (optional)</label>
              <Textarea value={needs} onChange={(e) => setNeeds(e.target.value)} rows={3}
                placeholder="Stress relief, better sleep, more energy, anxiety management..." className="resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Available time per day (optional)</label>
              <Input value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)}
                placeholder="e.g., 30 minutes, 1 hour" />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600" size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating plan...</>
                : <><Leaf className="h-4 w-4 mr-2" /> Generate Self-Care Plan</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Plan Header */}
          {result.self_care_plan && (
            <Card className="bg-gradient-to-br from-teal-500/15 to-cyan-500/15 border-teal-500/20">
              <CardContent className="p-6 text-center">
                <Leaf className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                <h3 className="text-xl font-black">{result.self_care_plan.plan_name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline">{result.self_care_plan.focus_area}</Badge>
                  <Badge variant="secondary">{result.self_care_plan.duration}</Badge>
                  <Badge variant="outline">{result.self_care_plan.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7-Day Routine */}
          {result.daily_routine && (
            <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-teal-400" /> 7-Day Routine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.daily_routine.map((day: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-teal-500/5 rounded-lg p-3 border border-teal-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{day.day}</span>
                      <Badge variant="secondary" className="text-[10px]">Goal: {day.self_care_score_goal}/10</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>🌅 <strong>Morning:</strong> {day.morning_ritual}</div>
                      <div>☀️ <strong>Afternoon:</strong> {day.afternoon_activity}</div>
                      <div>🌙 <strong>Evening:</strong> {day.evening_wind_down}</div>
                      <div>⭐ <strong>Challenge:</strong> {day.mini_challenge}</div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Wellness Categories */}
          {result.wellness_categories && (
            <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-pink-400" /> Wellness Areas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.wellness_categories.map((cat: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                    <span className="text-lg">{cat.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{cat.category}</span>
                        <span className="text-[10px] text-muted-foreground">{cat.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{cat.activity}</p>
                      <p className="text-xs text-teal-400 mt-1">✓ {cat.benefit}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Emergency Self-Care */}
          {result.emergency_self_care && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Emergency Self-Care</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.emergency_self_care.map((e: any, i: number) => (
                  <div key={i} className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                    <p className="font-bold text-sm mb-1">When: {e.situation}</p>
                    <p className="text-xs text-muted-foreground">⚡ Quick fix (5 min): {e.quick_fix}</p>
                    <p className="text-xs text-muted-foreground">🧘 Deeper (30 min): {e.deeper_practice}</p>
                    <p className="text-xs text-teal-400 mt-1 italic">💬 "{e.affirmation}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Habit Tracker */}
          {result.habit_tracker && (
            <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Habit Tracker</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.habit_tracker.map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-teal-500/5 rounded-lg p-2">
                      <div>
                        <p className="text-xs font-medium">{h.habit}</p>
                        <p className="text-[10px] text-muted-foreground">{h.frequency} • Importance: {h.importance}/10</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">{h.streak_reward}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {result.personalized_tips && (
            <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
              <CardContent className="p-4 space-y-2">
                <p className="font-bold text-sm">💡 Personalized Tips</p>
                {result.personalized_tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-teal-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Companion Note */}
          {result.companion_encouragement && (
            <Card className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm italic">🌿 {result.companion_encouragement}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => { setResult(null); setNeeds(""); setTimeAvailable(""); }} variant="outline" className="flex-1">New Plan</Button>
            <Badge variant="outline" className="text-xs self-center">Credits: {result.credits_remaining}</Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};
