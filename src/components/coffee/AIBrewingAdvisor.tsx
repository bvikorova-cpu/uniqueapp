import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Coffee, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AIBrewingAdvisor = ({ onBack }: { onBack: () => void }) => {
  const [method, setMethod] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!method || !question.trim()) { toast.error("Please select a method and describe your question"); return; }
    setLoading(true);
    setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "brewing", method, question }
      });
      if (error) throw error;
      setResult(data?.result || "No advice generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error generating advice");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coffee className="h-5 w-5 text-amber-400" />AI Brewing Advisor<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger><SelectValue placeholder="Select brewing method" /></SelectTrigger>
            <SelectContent>
              {["Pour Over (V60)", "French Press", "AeroPress", "Espresso Machine", "Moka Pot", "Cold Brew", "Chemex", "Siphon"].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Describe your brewing challenge, beans, or what you want to improve..." rows={4} />
          <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-800" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Get Brewing Advice"}
          </Button>
          {result && <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
