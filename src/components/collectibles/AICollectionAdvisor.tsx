import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function AICollectionAdvisor({ userId }: Props) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();

  const handleAnalyze = async () => {
    if (!credits || credits.credits_remaining < 5) {
      toast.error("Insufficient credits. You need 5 credits.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("collectible-ai", {
        body: { action: "advisor", userId }
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
      <FloatingHowItWorks title={"A I Collection Advisor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Collection Advisor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Collection Advisor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-rose-400" />
          <div>
            <h2 className="text-2xl font-bold">AI Collection Advisor</h2>
            <p className="text-sm text-muted-foreground">Smart portfolio recommendations to maximize your collection — 5 credits</p>
          </div>
        </div>

        <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Collection...</> : <><Sparkles className="h-4 w-4" /> Analyze My Collection (5 Credits)</>}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">Available: {credits?.credits_remaining || 0} credits</p>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.overview && (
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-2">📊 Collection Overview</h3>
              <p className="text-sm whitespace-pre-wrap">{result.overview}</p>
            </Card>
          )}
          {result.recommendations && (
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-2">🎯 Recommendations</h3>
              <p className="text-sm whitespace-pre-wrap">{result.recommendations}</p>
            </Card>
          )}
          {result.missingPieces && (
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-2">🧩 Missing Pieces</h3>
              <p className="text-sm whitespace-pre-wrap">{result.missingPieces}</p>
            </Card>
          )}
          {result.strategy && (
            <Card className="p-5 bg-primary/5 border-primary/20">
              <h3 className="font-bold text-lg mb-2">💎 Strategy</h3>
              <p className="text-sm whitespace-pre-wrap">{result.strategy}</p>
            </Card>
          )}
        </div>
      )}
    </div>
    </>
  );
}
