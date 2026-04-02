import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AICoffeeHealthAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [habits, setHabits] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!habits.trim()) { toast.error("Please describe your coffee habits"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "health_analysis", habits }
      });
      if (error) throw error;
      setResult(data?.result || "No analysis generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error analyzing");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-400" />AI Coffee Health Analyzer<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={habits} onChange={e => setHabits(e.target.value)} placeholder="Describe your daily coffee habits... e.g. '3 espressos daily, first at 6am, last at 4pm, sometimes with sugar'" rows={4} />
          <Button className="w-full bg-gradient-to-r from-red-600 to-rose-800" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Analyze Health Impact"}
          </Button>
          {result && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
