import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Map, Loader2, Sparkles, Trophy, Quote, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const BucketListView = () => {
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "bucket_list", interests: interests || undefined, budget: budget || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Bucket list created! 🗺️ (3 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const difficultyColor = (d: string) => {
    switch (d) { case "Easy": return "text-green-400"; case "Medium": return "text-yellow-400"; case "Hard": return "text-orange-400"; case "Epic": return "text-red-400"; default: return ""; }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Bucket List View"}
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Map className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Bucket List Generator
          </h2>
          <p className="text-muted-foreground mt-2">Create an epic friendship adventure list together</p>
          <Badge variant="outline" className="mt-2">3 Credits per list</Badge>
        </div>
      </motion.div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-cyan-500/20">
          <CardHeader><CardTitle className="text-lg">Customize Your Adventures</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Interests (optional)</label>
              <Textarea value={interests} onChange={(e) => setInterests(e.target.value)} rows={3}
                placeholder="Hiking, cooking, travel, art, music..." className="resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Budget range (optional)</label>
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., Low budget, Medium, No limit" />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600" size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
                : <><Map className="h-4 w-4 mr-2" /> Generate Bucket List</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Adventures */}
          {result.bucket_list && (
            <Card className="bg-card/80 backdrop-blur-xl border-cyan-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Rocket className="h-5 w-5 text-cyan-400" /> Your Adventures</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.bucket_list.map((item: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-cyan-500/5 rounded-lg p-3 border border-cyan-500/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <div>
                          <h4 className="font-bold text-sm">{item.adventure}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.why}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <Badge variant="outline" className="text-[10px] mb-1">{item.category}</Badge>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold ${difficultyColor(item.difficulty)}`}>{item.difficulty}</span>
                          <span className="text-[10px] text-muted-foreground">• {item.estimated_cost}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground">⏱ {item.time_needed}</span>
                      <span className="text-[10px] text-cyan-400">Fun: {item.fun_rating}/10</span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Themed Collections */}
          {result.themed_collections && (
            <Card className="bg-card/80 backdrop-blur-xl border-cyan-500/20">
              <CardHeader><CardTitle className="text-base">🎯 Themed Collections</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.themed_collections.map((col: any, i: number) => (
                  <div key={i} className="bg-cyan-500/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{col.theme}</span>
                      <Badge variant="secondary" className="text-[10px]">{col.vibe}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {col.adventures.map((a: string, j: number) => (
                        <Badge key={j} variant="outline" className="text-[10px]">{a}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dream Adventure */}
          {result.dream_adventure && (
            <Card className="bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-cyan-500/20">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-lg font-black">Ultimate Dream Adventure</h3>
                <p className="text-sm font-medium mt-2">{result.dream_adventure.ultimate}</p>
                <p className="text-xs text-muted-foreground mt-2">{result.dream_adventure.why_its_special}</p>
                <div className="flex justify-center gap-4 mt-3">
                  <Badge variant="outline" className="text-[10px]">📋 {result.dream_adventure.planning_tip}</Badge>
                  <Badge variant="outline" className="text-[10px]">⏰ {result.dream_adventure.estimated_timeline}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Companion Dare */}
          {result.companion_dare && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <p className="font-bold text-sm mb-1">🎲 Friend Dare!</p>
                <p className="text-sm text-muted-foreground">{result.companion_dare.dare}</p>
                <p className="text-xs text-orange-400 mt-1">Stakes: {result.companion_dare.stakes} • Deadline: {result.companion_dare.deadline}</p>
              </CardContent>
            </Card>
          )}

          {/* Quote */}
          {result.adventure_quote && (
            <Card className="bg-card/80 backdrop-blur-xl border-cyan-500/20">
              <CardContent className="p-4 text-center">
                <Quote className="h-4 w-4 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm italic">"{result.adventure_quote.quote}"</p>
                <p className="text-xs text-muted-foreground mt-1">— {result.adventure_quote.author}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => { setResult(null); setInterests(""); setBudget(""); }} variant="outline" className="flex-1">Generate New List</Button>
            <Badge variant="outline" className="text-xs self-center">Credits: {result.credits_remaining}</Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};
