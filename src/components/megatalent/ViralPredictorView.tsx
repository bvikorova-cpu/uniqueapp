import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, Sparkles, Flame, Zap, BarChart3, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ViralPredictorView = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!category || !title) { toast({ title: "Error", description: "Please fill category and title", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "viral_predictor", category, title, description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Prediction Ready! 🔥" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Viral Predictor View - How it works"} steps={[{ title: 'Open', desc: 'Access the Viral Predictor View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Viral Predictor View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">AI Viral Predictor</h2>
          <p className="text-muted-foreground mt-2">Predict the viral potential of your submission before posting</p>
          <Badge variant="outline" className="mt-2 border-red-500/30 text-red-500">4 Credits per prediction</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-red-500/20">
        <CardHeader><CardTitle className="text-lg">Describe Your Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
            <SelectContent>
              {["Drawing", "Singing", "Dance", "Photography", "Cooking", "Comedy", "Sports", "Music Production", "Digital Art", "Magic", "Parkour", "Other"].map(c => (
                <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Submission title..." />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your content in detail (style, unique elements, hook, etc.)..." className="min-h-[100px]" />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Predicting...</> : <><Flame className="h-4 w-4 mr-2" /> Predict Viral Potential</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">Viral Score</h3>
              <div className="text-6xl font-black text-red-500 mb-2">{result.viral_score}<span className="text-2xl text-muted-foreground">/100</span></div>
              <Progress value={result.viral_score} className="h-3 mb-3" />
              <p className="text-sm text-muted-foreground">{result.verdict}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-3">
            {result.factors?.map((f: any, i: number) => (
              <Card key={i} className="bg-card/80 backdrop-blur-xl border-border/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{f.name}</p>
                  <p className="text-2xl font-black">{f.score}<span className="text-sm text-muted-foreground">/100</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1">{f.insight}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {result.boost_suggestions && (
            <Card className="bg-card/80 backdrop-blur-xl border-orange-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> How to Boost Virality</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.boost_suggestions.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm"><Sparkles className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />{s}</div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.best_posting_strategy && (
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardContent className="p-4 flex items-start gap-2">
                <Eye className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div><p className="text-sm font-medium">Best Posting Strategy</p><p className="text-sm text-muted-foreground">{result.best_posting_strategy}</p></div>
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
    </>
  );
};