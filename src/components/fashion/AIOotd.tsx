import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Camera, Star, TrendingUp, Award, Zap } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 5;

export default function AIOotd() {
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits, spendCredit } = useAICredits();

  const { data: history } = useQuery({
    queryKey: ["ootd-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fashion_ootd")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "Outfit of the Day Score");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "ootd-score", outfitDescription: description, occasion, season },
      });
      if (error) throw error;

      await supabase.from("fashion_ootd").insert({
        user_id: session.user.id,
        outfit_description: description,
        ai_score: data.score?.overall_score,
        ai_feedback: JSON.stringify(data.score),
        style_tags: data.score?.style_tags || [],
        credits_used: CREDIT_COST,
      });

      return data.score;
    },
    onSuccess: (score) => {
      setResult(score);
      toast.success(`Your outfit scored ${score?.overall_score}/100!`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-bold text-primary">{value}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title="How AIOotd works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Outfit of the Day</h2>
            <p className="text-sm text-muted-foreground">Get your daily outfit scored by AI fashion experts • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Describe Your Outfit</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., White oversized blazer, black slim-fit trousers, white sneakers, gold watch, leather crossbody bag..."
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Occasion</Label>
              <Input value={occasion} onChange={e => setOccasion(e.target.value)} placeholder="e.g., Office, Date Night" />
            </div>
            <div>
              <Label>Season</Label>
              <Input value={season} onChange={e => setSeason(e.target.value)} placeholder="e.g., Summer, Winter" />
            </div>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !description.trim() || (credits?.credits_remaining || 0) < CREDIT_COST}
            className="w-full gap-2"
          >
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Star className="h-4 w-4" /> Score My Outfit ({CREDIT_COST} Credits)</>}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black">Your Score</h3>
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {result.overall_score}/100
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <ScoreBar label="Style" value={result.style_score || 0} />
                <ScoreBar label="Color Harmony" value={result.color_harmony_score || 0} />
                <ScoreBar label="Occasion Fit" value={result.occasion_appropriateness_score || 0} />
                <ScoreBar label="Trend Relevance" value={result.trend_relevance_score || 0} />
              </div>
            </Card>

            {result.style_tags?.length > 0 && (
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-white/10">
                <h4 className="font-bold mb-2">Style Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {result.style_tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
              </Card>
            )}

            {result.celebrity_match && (
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-white/10">
                <h4 className="font-bold mb-1">Celebrity Style Match</h4>
                <p className="text-sm text-muted-foreground">{result.celebrity_match}</p>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.strengths?.length > 0 && (
                <Card className="p-5 bg-emerald-500/5 border-emerald-500/20">
                  <h4 className="font-bold mb-2 text-emerald-400">✨ Strengths</h4>
                  <ul className="space-y-1 text-sm">
                    {result.strengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </Card>
              )}
              {result.improvements?.length > 0 && (
                <Card className="p-5 bg-amber-500/5 border-amber-500/20">
                  <h4 className="font-bold mb-2 text-amber-400">💡 Improvements</h4>
                  <ul className="space-y-1 text-sm">
                    {result.improvements.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </Card>
              )}
            </div>

            {result.confidence_boost && (
              <Card className="p-5 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
                <p className="text-sm font-medium text-center italic">"{result.confidence_boost}"</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {history && history.length > 0 && (
        <Card className="p-5 bg-card/80 backdrop-blur-xl border-white/10">
          <h3 className="font-bold mb-3">Recent Scores</h3>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <p className="text-sm line-clamp-1 flex-1">{item.outfit_description}</p>
                <span className="text-sm font-bold text-primary ml-2">{item.ai_score ? `${Number(item.ai_score)}/100` : "—"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </>
    );
}
