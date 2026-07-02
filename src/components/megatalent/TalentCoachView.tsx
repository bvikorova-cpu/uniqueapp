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
import { GraduationCap, Loader2, Sparkles, Target, Dumbbell, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TalentCoachView = () => {
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
        body: { action: "talent_coach", category, title, description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Coaching Ready! 🎯" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Talent Coach View - How it works"} steps={[{ title: 'Open', desc: 'Access the Talent Coach View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Talent Coach View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">AI Talent Coach</h2>
          <p className="text-muted-foreground mt-2">Get personalized coaching to improve your talent and win competitions</p>
          <Badge variant="outline" className="mt-2 border-yellow-500/30 text-yellow-500">4 Credits per analysis</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
        <CardHeader><CardTitle className="text-lg">Describe Your Submission</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
            <SelectContent>
              {["Drawing", "Singing", "Dance", "Photography", "Cooking", "Comedy", "Sports", "Music Production", "Digital Art", "Other"].map(c => (
                <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Submission title..." />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your talent/performance..." className="min-h-[100px]" />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Get AI Coaching</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h3 className="text-xl font-bold">Confidence Score: {result.confidence_score}/100</h3>
              </div>
              <p className="text-muted-foreground">{result.overall_assessment}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-green-500" /> Strengths</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{result.strengths?.map((s: string, i: number) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-green-500">✓</span>{s}</li>)}</ul></CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Dumbbell className="h-4 w-4 text-amber-500" /> Areas to Improve</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{result.areas_to_improve?.map((s: string, i: number) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-amber-500">→</span>{s}</li>)}</ul></CardContent>
            </Card>
          </div>

          {result.specific_tips && (
            <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm">Specific Tips</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.specific_tips.map((tip: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Badge variant="outline" className={tip.priority === 'high' ? 'border-red-500 text-red-500' : tip.priority === 'medium' ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}>{tip.priority}</Badge>
                    <div><p className="text-sm font-medium">{tip.area}</p><p className="text-xs text-muted-foreground">{tip.tip}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.next_milestone && (
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="p-4 flex items-start gap-2">
                <Trophy className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div><p className="text-sm font-medium">Next Milestone</p><p className="text-sm text-muted-foreground">{result.next_milestone}</p></div>
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
