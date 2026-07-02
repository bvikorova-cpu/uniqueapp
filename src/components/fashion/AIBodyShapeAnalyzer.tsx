import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIBodyShapeAnalyzer() {
  const { credits } = useAICredits();
  const [height, setHeight] = useState("");
  const [bodyShape, setBodyShape] = useState("hourglass");
  const [styleGoal, setStyleGoal] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if ((credits?.credits_remaining || 0) < 8) { toast.error("You need 8 credits"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "body-shape", height, bodyShape, styleGoal }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Body shape analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIBody Shape Analyzer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-lime-500/10 to-green-500/10 border-lime-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-7 w-7 text-lime-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black">Body Shape Analyzer</h2>
            <p className="text-sm text-muted-foreground">AI styling tips for your body type — 8 credits</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="E.g., 170" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Body Shape</Label>
              <Select value={bodyShape} onValueChange={setBodyShape}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourglass">Hourglass</SelectItem>
                  <SelectItem value="pear">Pear</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="inverted-triangle">Inverted Triangle</SelectItem>
                  <SelectItem value="not-sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style Goal</Label>
              <Select value={styleGoal} onValueChange={setStyleGoal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced Silhouette</SelectItem>
                  <SelectItem value="elongating">Elongating</SelectItem>
                  <SelectItem value="curves">Accentuate Curves</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="powerful">Power Dressing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Analyze Body Shape (8 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.shapeAnalysis && <Card className="p-5"><h3 className="font-bold text-lg mb-2">📐 Shape Analysis</h3><p className="text-sm whitespace-pre-wrap">{result.shapeAnalysis}</p></Card>}
          {result.bestStyles && <Card className="p-5"><h3 className="font-bold text-lg mb-2">✅ Best Styles For You</h3><p className="text-sm whitespace-pre-wrap">{result.bestStyles}</p></Card>}
          {result.avoidStyles && <Card className="p-5"><h3 className="font-bold text-lg mb-2">❌ Styles to Avoid</h3><p className="text-sm whitespace-pre-wrap">{result.avoidStyles}</p></Card>}
          {result.shoppingGuide && <Card className="p-5 bg-primary/5 border-primary/20"><h3 className="font-bold text-lg mb-2">🛍️ Shopping Guide</h3><p className="text-sm whitespace-pre-wrap">{result.shoppingGuide}</p></Card>}
        </div>
      )}
    </div>
    </>
    );
}
