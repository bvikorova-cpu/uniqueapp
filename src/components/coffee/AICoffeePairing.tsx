import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AICoffeePairing = ({ onBack }: { onBack: () => void }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePair = async () => {
    if (!input.trim()) { toast.error("Please describe your coffee or food"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "food_pairing", input }
      });
      if (error) throw error;
      setResult(data?.result || "No pairings generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error generating pairings");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-orange-400" />AI Coffee & Food Pairing<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Describe your coffee or food... e.g. 'Dark roast Colombian with chocolate notes' or 'Croissant and pastries'" rows={4} />
          <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-800" onClick={handlePair} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Pairing...</> : "Find Perfect Pairing"}
          </Button>
          {result && <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
