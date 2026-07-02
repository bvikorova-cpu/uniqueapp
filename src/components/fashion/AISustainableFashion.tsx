import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AISustainableFashion() {
  const { credits } = useAICredits();
  const [wardrobe, setWardrobe] = useState("");
  const [budget, setBudget] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!wardrobe) { toast.error("Describe your current wardrobe"); return; }
    if ((credits?.credits_remaining || 0) < 6) { toast.error("You need 6 credits"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "sustainable", wardrobe, budget }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Sustainable fashion report ready!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AISustainable Fashion works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="h-7 w-7 text-green-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black">Sustainable Fashion AI</h2>
            <p className="text-sm text-muted-foreground">Eco-friendly wardrobe recommendations — 6 credits</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Current Wardrobe Description</Label>
            <Textarea value={wardrobe} onChange={e => setWardrobe(e.target.value)} placeholder="Describe what's in your closet — types of clothes, brands, materials, what you wear most..." rows={4} />
          </div>
          <div>
            <Label>Budget Preference</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal (DIY & Thrift)</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="premium">Premium Sustainable Brands</SelectItem>
                <SelectItem value="luxury">Luxury Eco-Fashion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Get Sustainable Report (6 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.sustainabilityScore && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🌍 Sustainability Score</h3><p className="text-sm whitespace-pre-wrap">{result.sustainabilityScore}</p></Card>}
          {result.swapSuggestions && <Card className="p-5"><h3 className="font-bold text-lg mb-2">♻️ Swap Suggestions</h3><p className="text-sm whitespace-pre-wrap">{result.swapSuggestions}</p></Card>}
          {result.ecoAlternatives && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🌿 Eco Alternatives</h3><p className="text-sm whitespace-pre-wrap">{result.ecoAlternatives}</p></Card>}
          {result.actionPlan && <Card className="p-5 bg-primary/5 border-primary/20"><h3 className="font-bold text-lg mb-2">📋 30-Day Action Plan</h3><p className="text-sm whitespace-pre-wrap">{result.actionPlan}</p></Card>}
        </div>
      )}
    </div>
    </>
    );
}
