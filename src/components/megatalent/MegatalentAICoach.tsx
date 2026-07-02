import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2, Sparkles, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category: string;
}

export default function MegatalentAICoach({ category }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "talent_coach", title, description, category, mediaType: "video" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data);
      toast({ title: "AI Coach analysis ready ✨" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Megatalent A I Coach - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent A I Coach section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent A I Coach.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            AI Talent Coach
            <Badge variant="outline" className="ml-auto border-primary/30 text-primary text-[10px]">
              4 credits
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Get personalized coaching, strengths, weaknesses and a practice plan for your submission.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Your submission title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Describe your performance / video..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            onClick={run}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Get AI Coaching
              </>
            )}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 pt-3 border-t border-border/20"
            >
              {typeof result.confidence_score === "number" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-bold">{result.confidence_score}/100</span>
                  </div>
                  <Progress value={result.confidence_score} className="h-2" />
                </div>
              )}

              {result.overall_assessment && (
                <p className="text-sm">{result.overall_assessment}</p>
              )}

              {result.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-500 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Strengths
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                    {result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.areas_to_improve?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-500 mb-1 flex items-center gap-1">
                    <Target className="h-3 w-3" /> Areas to Improve
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                    {result.areas_to_improve.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.specific_tips?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Specific Tips
                  </p>
                  {result.specific_tips.map((t: any, i: number) => (
                    <div key={i} className="text-xs bg-card/50 rounded-lg p-2 border border-border/20">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold">{t.area}</span>
                        <Badge variant="outline" className="text-[9px]">{t.priority}</Badge>
                      </div>
                      <p className="text-muted-foreground">{t.tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.next_milestone && (
                <div className="flex items-start gap-2 text-xs bg-primary/10 rounded-lg p-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Next milestone: </span>
                    <span className="text-muted-foreground">{result.next_milestone}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
