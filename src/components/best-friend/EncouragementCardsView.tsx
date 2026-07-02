import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { HeartHandshake, Loader2, Sparkles, Star } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const colorMap: Record<string, string> = {
  lavender: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
  coral: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  mint: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  gold: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
};

export const EncouragementCardsView = () => {
  const { toast } = useToast();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "encouragement_cards", situation: situation.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Cards Created! 💖" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Encouragement Cards View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Encouragement Cards
          </h2>
          <p className="text-muted-foreground mt-2">Personalized motivational cards crafted by AI to uplift your spirit</p>
          <Badge variant="outline" className="mt-2">3 Credits per generation</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-pink-500/20">
        <CardHeader><CardTitle className="text-lg">Create Your Cards</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={situation} onChange={(e) => setSituation(e.target.value)}
            placeholder="Optional: describe your situation (e.g., job interview, exam stress)..." />
          <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-pink-600 to-rose-600" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> Generate Encouragement</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.cards?.map((card: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                <Card className={`bg-gradient-to-br ${colorMap[card.color_theme] || colorMap.lavender} backdrop-blur-xl h-full`}>
                  <CardContent className="p-6 text-center">
                    <span className="text-4xl mb-3 block">{card.emoji}</span>
                    <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.message}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {result.daily_mantra && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <Star className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
                <p className="font-semibold text-sm">Daily Mantra</p>
                <p className="text-lg font-bold mt-1 italic">"{result.daily_mantra}"</p>
              </CardContent>
            </Card>
          )}

          {result.gratitude_prompt && (
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-1">🙏 Gratitude Reflection:</p>
                <p className="text-sm text-muted-foreground italic">{result.gratitude_prompt}</p>
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
  );
};
