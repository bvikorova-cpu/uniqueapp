import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sunrise, Loader2, Moon, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const DailyAffirmationsView = () => {
  const [focus, setFocus] = useState("");
  const [challenges, setChallenges] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "daily_affirmations", focus, challenges },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Affirmations created! (2 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const categoryColors: Record<string, string> = {
    Confidence: "text-yellow-400",
    Gratitude: "text-green-400",
    Growth: "text-blue-400",
    Love: "text-pink-400",
    Strength: "text-red-400",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Daily Affirmations View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <Sunrise className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black">AI Daily Affirmations</h2>
        <p className="text-muted-foreground text-sm">Personalized morning affirmations & evening reflections</p>
        <Badge variant="secondary" className="mt-2">2 Credits</Badge>
      </div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">What would you like to focus on? (optional)</label>
              <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g., self-confidence, career growth, inner peace..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Current challenges (optional)</label>
              <Input value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="e.g., stress at work, relationship worries..." />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Affirmations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Morning Affirmations */}
          <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sunrise className="h-5 w-5 text-yellow-400" /> Morning Affirmations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {result.morning_affirmations?.map((a: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/10">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{a.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{a.affirmation}</p>
                      <Badge variant="outline" className={`text-[10px] mt-1 ${categoryColors[a.category] || ""}`}>{a.category}</Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Power Mantra */}
          {result.power_mantra && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border-purple-500/20">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-lg font-black">&ldquo;{result.power_mantra.mantra}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-2">{result.power_mantra.explanation}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{result.power_mantra.when_to_use}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Evening Reflections */}
          {result.evening_reflections && (
            <Card className="bg-card/80 backdrop-blur-xl border-indigo-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Moon className="h-5 w-5 text-indigo-400" /> Evening Reflections</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.evening_reflections.map((r: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50">
                    <p className="text-sm font-medium">{r.reflection}</p>
                    <p className="text-xs text-muted-foreground mt-1 italic">Journal prompt: {r.prompt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Weekly Intention */}
          {result.weekly_intention && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-4">
                <p className="font-bold text-sm mb-2">📋 Weekly Intention: {result.weekly_intention.intention}</p>
                <div className="flex flex-wrap gap-1">
                  {result.weekly_intention.action_steps?.map((s: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Note */}
          {result.personalized_note && (
            <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm italic">{result.personalized_note}</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setResult(null)} variant="outline" className="w-full">Generate New Affirmations</Button>
        </div>
      )}
    </div>
  );
};
