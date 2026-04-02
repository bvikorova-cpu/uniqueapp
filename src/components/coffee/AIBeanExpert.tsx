import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AIBeanExpert = ({ onBack }: { onBack: () => void }) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!query.trim()) { toast.error("Please describe the coffee bean or origin"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "bean_expert", query }
      });
      if (error) throw error;
      setResult(data?.result || "No analysis generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error analyzing bean");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-green-400" />AI Bean Expert<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Describe a coffee bean, origin, roast level, or paste a label... e.g. 'Ethiopian Yirgacheffe light roast'" rows={4} />
          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-800" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Analyze Bean"}
          </Button>
          {result && <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
