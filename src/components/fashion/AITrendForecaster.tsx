import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AITrendForecaster() {
  const { credits } = useAICredits();
  const [season, setSeason] = useState("summer-2026");
  const [category, setCategory] = useState("womenswear");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleForecast = async () => {
    if ((credits?.credits_remaining || 0) < 10) { toast.error("You need 10 credits"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "trend-forecaster", season, category }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Trend forecast generated!");
    } catch (e: any) {
      toast.error(e.message || "Forecast failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AITrend Forecaster works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-7 w-7 text-violet-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black">AI Trend Forecaster</h2>
            <p className="text-sm text-muted-foreground">Predict upcoming fashion trends — 10 credits</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summer-2026">Summer 2026</SelectItem>
                <SelectItem value="fall-2026">Fall 2026</SelectItem>
                <SelectItem value="winter-2027">Winter 2027</SelectItem>
                <SelectItem value="spring-2027">Spring 2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="womenswear">Womenswear</SelectItem>
                <SelectItem value="menswear">Menswear</SelectItem>
                <SelectItem value="streetwear">Streetwear</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="footwear">Footwear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleForecast} disabled={loading} className="w-full gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Forecasting...</> : <><Sparkles className="h-4 w-4" /> Generate Trend Forecast (10 Credits)</>}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">Available: {credits?.credits_remaining || 0} credits</p>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.topTrends && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🔥 Top Trends</h3><p className="text-sm whitespace-pre-wrap">{result.topTrends}</p></Card>}
          {result.colorTrends && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🎨 Color Trends</h3><p className="text-sm whitespace-pre-wrap">{result.colorTrends}</p></Card>}
          {result.fabricTrends && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🧵 Fabric & Material Trends</h3><p className="text-sm whitespace-pre-wrap">{result.fabricTrends}</p></Card>}
          {result.investmentPieces && <Card className="p-5 bg-primary/5 border-primary/20"><h3 className="font-bold text-lg mb-2">💎 Investment Pieces</h3><p className="text-sm whitespace-pre-wrap">{result.investmentPieces}</p></Card>}
        </div>
      )}
    </div>
    </>
    );
}
