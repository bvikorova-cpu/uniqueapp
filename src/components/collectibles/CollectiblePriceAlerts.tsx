import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Bell, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { useCollectibles } from "@/hooks/useCollectibles";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function CollectiblePriceAlerts({ userId }: Props) {
  const [itemName, setItemName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();
  const { myCollectibles } = useCollectibles(userId);

  const handleAnalyze = async () => {
    if (!itemName) return;
    if (!credits || credits.credits_remaining < 5) {
      toast.error("Insufficient credits. You need 5 credits.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("collectible-ai", {
        body: { action: "price-alert", userId, itemName }
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Collectible Price Alerts - How it works"} steps={[{ title: 'Open', desc: 'Access the Collectible Price Alerts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collectible Price Alerts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-8 w-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold">Price Alerts & Trends</h2>
            <p className="text-sm text-muted-foreground">AI-powered market monitoring and price predictions — 5 credits per analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Enter collectible name or category to monitor..."
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            disabled={loading}
          />

          {myCollectibles && myCollectibles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Quick pick:</span>
              {[...new Set(myCollectibles.map((c: any) => c.collectible_type).filter(Boolean))].slice(0, 4).map((type: any) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setItemName(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={loading || !itemName} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Market...</> : <><Sparkles className="h-4 w-4" /> Analyze Price Trends (5 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.currentTrend && (
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-2">📊 Current Market Trend</h3>
              <p className="text-sm whitespace-pre-wrap">{result.currentTrend}</p>
            </Card>
          )}
          {result.priceHistory && (
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-2">📈 Price History Analysis</h3>
              <p className="text-sm whitespace-pre-wrap">{result.priceHistory}</p>
            </Card>
          )}
          {result.prediction && (
            <Card className="p-5 bg-primary/5 border-primary/20">
              <h3 className="font-bold text-lg mb-2">🔮 Price Prediction</h3>
              <p className="text-sm whitespace-pre-wrap">{result.prediction}</p>
            </Card>
          )}
          {result.alertRecommendation && (
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-2">🔔 Alert Recommendation</h3>
              <p className="text-sm whitespace-pre-wrap">{result.alertRecommendation}</p>
            </Card>
          )}
        </div>
      )}
    </div>
    </>
  );
}
