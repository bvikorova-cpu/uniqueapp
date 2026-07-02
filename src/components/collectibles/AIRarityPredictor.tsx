import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function AIRarityPredictor({ userId }: Props) {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();

  const handlePredict = async () => {
    if (!itemName) return;
    if (!credits || credits.credits_remaining < 8) {
      toast.error("Insufficient credits. You need 8 credits.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("collectible-ai", {
        body: { action: "rarity-predict", itemName, itemDescription, userId }
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Rarity Predictor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Rarity Predictor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Rarity Predictor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-8 w-8 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold">AI Rarity Predictor</h2>
            <p className="text-sm text-muted-foreground">Predict future value and rarity trends — 8 credits per analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input placeholder="Item name (e.g. Crystal Dragon Egg)" value={itemName} onChange={e => setItemName(e.target.value)} disabled={loading} />
          <Textarea placeholder="Describe the item's attributes, rarity level, and special properties..." value={itemDescription} onChange={e => setItemDescription(e.target.value)} disabled={loading} rows={3} />
          <Button onClick={handlePredict} disabled={loading || !itemName} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Predict Rarity (8 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Prediction Results</h3>
          {result.currentRarity && <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Current Rarity:</span><Badge>{result.currentRarity}</Badge></div>}
          {result.predictedRarity && <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Predicted Rarity (30d):</span><Badge variant="secondary">{result.predictedRarity}</Badge></div>}
          {result.valueEstimate && <div><span className="text-sm text-muted-foreground">Estimated Value:</span><p className="text-lg font-bold text-primary">{result.valueEstimate}</p></div>}
          {result.analysis && <div><span className="text-sm text-muted-foreground">AI Analysis:</span><p className="text-sm mt-1 whitespace-pre-wrap">{result.analysis}</p></div>}
          {result.investmentTip && <div className="bg-primary/10 rounded-lg p-3"><span className="text-sm font-semibold">💡 Investment Tip:</span><p className="text-sm mt-1">{result.investmentTip}</p></div>}
        </Card>
      )}
    </div>
    </>
  );
}
