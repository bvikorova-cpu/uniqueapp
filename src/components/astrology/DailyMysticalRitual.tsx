import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sun, Moon, Star, Sparkles, Hash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface RitualResult {
  cardOfTheDay: { name: string; meaning: string };
  luckyNumber: number;
  affirmation: string;
  cosmicEnergy: string;
  elementOfTheDay: string;
  moonPhase: string;
}

export const DailyMysticalRitual = () => {
  const [result, setResult] = useState<RitualResult | null>(null);
  const { credits } = useAstrologyCredits();
  const RITUAL_COST = 3;

  const ritualMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: {
          type: 'daily_ritual',
          data: { date: new Date().toISOString().split('T')[0] }
        }
      });

      if (error) throw error;
      return data as RitualResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Daily ritual revealed! ✨");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const ritualCards = result ? [
    { icon: Star, title: "Card of the Day", value: result.cardOfTheDay?.name || "—", sub: result.cardOfTheDay?.meaning || "", gradient: "from-amber-500 to-yellow-400" },
    { icon: Hash, title: "Lucky Number", value: String(result.luckyNumber || "—"), sub: "Your cosmic number", gradient: "from-purple-500 to-violet-400" },
    { icon: Moon, title: "Moon Phase", value: result.moonPhase || "—", sub: result.elementOfTheDay || "", gradient: "from-blue-500 to-cyan-400" },
    { icon: Sun, title: "Cosmic Energy", value: result.cosmicEnergy || "—", sub: "Today's vibration", gradient: "from-pink-500 to-rose-400" },
  ] : [];

  return (
    <>
      <FloatingHowItWorks
        title='Daily Mystical Ritual'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Daily Mystical Ritual panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-5 sm:p-6 bg-card/90 backdrop-blur-xl border-border/30 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-black text-foreground">Daily Mystical Ritual</h3>
        </div>
        <span className="text-xs text-muted-foreground">{RITUAL_COST} credits</span>
      </div>

      {!result ? (
        <div className="text-center py-6">
          <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center border border-amber-500/30">
            <Star className="w-8 h-8 text-amber-500" />
          </motion.div>
          <p className="text-sm text-muted-foreground mb-4">Reveal your daily card, lucky number, moon phase & cosmic affirmation</p>
          <Button
            onClick={() => ritualMutation.mutate()}
            disabled={ritualMutation.isPending || (credits?.credits_remaining || 0) < RITUAL_COST}
            className="bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 text-white"
          >
            {ritualMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Channeling...</> : "Begin Ritual ✨"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {ritualCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="relative bg-muted/50 rounded-xl p-3 border border-border/30 overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient}`} />
                <card.icon className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-sm font-bold text-foreground truncate">{card.value}</p>
                <p className="text-[10px] text-muted-foreground truncate">{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {result.affirmation && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Today's Affirmation</p>
              <p className="text-sm font-semibold text-foreground italic">"{result.affirmation}"</p>
            </motion.div>
          )}

          <Button variant="outline" size="sm" onClick={() => setResult(null)} className="w-full">
            Ritual Again
          </Button>
        </div>
      )}
    </Card>
    </>
  );
};
