import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AICafeRecommender = ({ onBack }: { onBack: () => void }) => {
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    if (!preferences.trim()) { toast.error("Please describe what you're looking for"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "cafe_recommend", preferences }
      });
      if (error) throw error;
      setResult(data?.result || "No recommendations generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error getting recommendations");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-rose-400" />AI Cafe Recommender<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="Describe your ideal cafe... e.g. 'Cozy place in Bratislava with specialty coffee and good pastries, Wi-Fi for work'" rows={4} />
          <Button className="w-full bg-gradient-to-r from-rose-600 to-pink-800" onClick={handleRecommend} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : "Find Perfect Cafe"}
          </Button>
          {result && <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
