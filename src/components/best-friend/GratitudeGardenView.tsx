import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Flower2, Loader2, Sparkles, Quote, Leaf, TreePine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const GratitudeGardenView = () => {
  const [gratitude, setGratitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const create = async () => {
    if (!gratitude.trim()) { toast.error("Share what you're grateful for"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "gratitude_garden", gratitude },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Gratitude flower planted! 🌸 (3 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Gratitude Garden View"}
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Flower2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Gratitude Garden
          </h2>
          <p className="text-muted-foreground mt-2">Cultivate thankfulness and watch your gratitude garden bloom</p>
          <Badge variant="outline" className="mt-2">3 Credits per entry</Badge>
        </div>
      </motion.div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
          <CardHeader><CardTitle className="text-lg">What are you grateful for today?</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} rows={4}
              placeholder="I'm grateful for my best friend who always listens..." className="resize-none" />
            <Button onClick={create} disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600" size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Planting...</>
                : <><Flower2 className="h-4 w-4 mr-2" /> Plant Gratitude Flower</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Flower Card */}
          {result.garden_entry && (
            <Card className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 border-green-500/20">
              <CardContent className="p-6 text-center">
                <span className="text-5xl block mb-3">{result.garden_entry.flower_emoji}</span>
                <h3 className="text-xl font-black">{result.garden_entry.flower_name}</h3>
                <Badge className="mt-2" style={{ backgroundColor: result.garden_entry.color + "30", color: result.garden_entry.color }}>
                  {result.garden_entry.bloom_stage}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Analysis */}
          {result.gratitude_analysis && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-green-400" /> Gratitude Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-green-400">{result.gratitude_analysis.depth_score}/10</div>
                  <div>
                    <Badge variant="outline">{result.gratitude_analysis.category}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{result.gratitude_analysis.emotional_impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reflections */}
          {result.reflections && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Leaf className="h-5 w-5 text-green-400" /> Reflections</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.reflections.map((r: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                    <p className="text-sm font-medium">{r.emoji} {r.reflection}</p>
                    <p className="text-xs text-muted-foreground mt-1 italic">→ {r.prompt}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Gratitude Chain */}
          {result.gratitude_chain && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardHeader><CardTitle className="text-base">🔗 Gratitude Chain</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.gratitude_chain.map((item: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-300">{item}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Garden Stats */}
          {result.garden_stats && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div><div className="text-xl font-black text-green-400">{result.garden_stats.total_flowers}</div><p className="text-xs text-muted-foreground">Flowers</p></div>
                  <div><div className="text-xl font-black text-emerald-400">{result.garden_stats.garden_health}/100</div><p className="text-xs text-muted-foreground">Health</p></div>
                  <div><div className="text-sm font-bold">{result.garden_stats.rarest_bloom}</div><p className="text-xs text-muted-foreground">Rarest</p></div>
                  <div><div className="text-sm font-bold">{result.garden_stats.season}</div><p className="text-xs text-muted-foreground">Season</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenge */}
          {result.daily_gratitude_challenge && (
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-bold mb-1">🌱 Daily Challenge: {result.daily_gratitude_challenge.difficulty}</p>
                <p className="text-sm text-muted-foreground">{result.daily_gratitude_challenge.challenge}</p>
                <p className="text-xs text-green-400 mt-1">Reward: {result.daily_gratitude_challenge.reward}</p>
              </CardContent>
            </Card>
          )}

          {/* Quote */}
          {result.wisdom_quote && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardContent className="p-4 text-center">
                <Quote className="h-5 w-5 text-green-400 mx-auto mb-2" />
                <p className="text-sm italic">"{result.wisdom_quote.quote}"</p>
                <p className="text-xs text-muted-foreground mt-1">— {result.wisdom_quote.author}</p>
              </CardContent>
            </Card>
          )}

          {/* Companion Note */}
          {result.companion_note && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm italic">💚 {result.companion_note}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => { setResult(null); setGratitude(""); }} variant="outline" className="flex-1">Plant Another</Button>
            <Badge variant="outline" className="text-xs self-center">Credits: {result.credits_remaining}</Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};
