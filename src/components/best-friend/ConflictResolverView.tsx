import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Loader2, Sparkles, Shield, MessageSquare, Heart, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ConflictResolverView = () => {
  const [conflict, setConflict] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const resolve = async () => {
    if (!conflict.trim()) { toast.error("Describe the conflict"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "conflict_resolver", conflict },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Resolution plan ready! ⚖️ (4 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Conflict Resolver View"}
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Conflict Resolver
          </h2>
          <p className="text-muted-foreground mt-2">Get balanced, empathetic guidance to resolve friendship disagreements</p>
          <Badge variant="outline" className="mt-2">4 Credits per session</Badge>
        </div>
      </motion.div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
          <CardHeader><CardTitle className="text-lg">Describe the situation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={conflict} onChange={(e) => setConflict(e.target.value)} rows={5}
              placeholder="My friend and I had a disagreement about..." className="resize-none" />
            <Button onClick={resolve} disabled={loading} className="w-full bg-gradient-to-r from-amber-600 to-orange-600" size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
                : <><Scale className="h-4 w-4 mr-2" /> Get Resolution Plan</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Analysis */}
          {result.situation_analysis && (
            <Card className="bg-gradient-to-br from-amber-500/15 to-orange-500/15 border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{result.situation_analysis.conflict_type}</Badge>
                  <span className="text-sm">Severity: <span className="font-bold text-amber-400">{result.situation_analysis.severity}/10</span></span>
                </div>
                <p className="text-sm text-muted-foreground">{result.situation_analysis.summary}</p>
                {result.situation_analysis.both_perspectives && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {result.situation_analysis.both_perspectives.map((p: string, i: number) => (
                      <div key={i} className="bg-card/60 rounded-lg p-3 border border-border/50">
                        <p className="text-xs font-bold mb-1 text-amber-400">Perspective {i + 1}</p>
                        <p className="text-xs text-muted-foreground">{p}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Emotional Map */}
          {result.emotional_map && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-pink-400" /> Emotional Map</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.emotional_map.map((e: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-amber-500/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{e.emoji}</span><span className="font-bold text-sm">{e.emotion}</span></div>
                    <p className="text-xs text-muted-foreground"><strong>Source:</strong> {e.source}</p>
                    <p className="text-xs text-green-400 mt-1">✓ {e.validation}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Resolution Steps */}
          {result.resolution_steps && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-400" /> Resolution Steps</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.resolution_steps.map((s: any, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Step {i + 1}: {s.step}</span>
                      <Badge variant="secondary" className="text-[10px]">{s.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.action}</p>
                    <div className="bg-amber-500/5 rounded p-2 mt-2 border-l-2 border-amber-500/30">
                      <p className="text-xs italic">💬 "{s.script}"</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Communication Templates */}
          {result.communication_templates && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-amber-400" /> Communication Templates</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.communication_templates.map((t: any, i: number) => (
                  <div key={i} className="bg-card/60 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{t.situation}</span>
                      <Badge variant="outline" className="text-[10px]">{t.tone}</Badge>
                    </div>
                    <p className="text-xs text-amber-400 mb-1">Opener: "{t.opener}"</p>
                    <p className="text-xs text-muted-foreground italic">{t.full_message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Healing Timeline */}
          {result.healing_timeline && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
              <CardHeader><CardTitle className="text-base">🕊️ Healing Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {["immediate", "short_term", "long_term"].map((key) => (
                  <div key={key} className="flex items-start gap-2 text-sm">
                    <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div><span className="font-medium capitalize">{key.replace("_", " ")}:</span> <span className="text-muted-foreground">{result.healing_timeline[key]}</span></div>
                  </div>
                ))}
                <p className="text-xs text-amber-400 mt-2">⏱ Est. recovery: {result.healing_timeline.recovery_estimate}</p>
              </CardContent>
            </Card>
          )}

          {/* Preservation Score */}
          {result.friendship_preservation_score && (
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-black text-green-400">{result.friendship_preservation_score}%</div>
                <p className="text-xs text-muted-foreground">Friendship Preservation Score</p>
              </CardContent>
            </Card>
          )}

          {/* Mediator Note */}
          {result.mediator_note && (
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm italic">⚖️ {result.mediator_note}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => { setResult(null); setConflict(""); }} variant="outline" className="flex-1">New Situation</Button>
            <Badge variant="outline" className="text-xs self-center">Credits: {result.credits_remaining}</Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};
