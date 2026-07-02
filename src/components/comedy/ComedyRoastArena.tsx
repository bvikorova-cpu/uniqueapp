import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flame, Trophy, ArrowLeft, Zap, Coins } from "lucide-react";
import { useComedyCurrency } from "@/hooks/useComedy";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  onBack: () => void;
}

export const ComedyRoastArena = ({ onBack }: Props) => {
  const { currency, refetch } = useComedyCurrency();
  const [target, setTarget] = useState("");
  const [roast, setRoast] = useState("");
  const [aiScore, setAiScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitRoast = async () => {
    if (!target.trim() || !roast.trim()) {
      toast.error("Enter both a target and your roast!");
      return;
    }
    if (!currency || currency.coins < 15) {
      toast.error("You need at least 15 coins for a roast battle!");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deduct coins
      await supabase
        .from("comedy_currency")
        .update({ coins: currency.coins - 15 })
        .eq("user_id", user.id);

      // AI Judge the roast
      const { data, error } = await supabase.functions.invoke("comedy-ai-judge", {
        body: { type: "roast", target, content: roast },
      });

      if (error) throw error;

      setAiScore(data);
      refetch();
      toast.success("Roast judged! 🔥");
    } catch (error) {
      console.error("Roast error:", error);
      toast.error("Failed to submit roast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Comedy Roast Arena - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedy Roast Arena section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedy Roast Arena.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Flame className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl sm:text-3xl font-black">Comedy Roast Arena</h2>
      </div>

      <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <p className="text-sm text-muted-foreground mb-4">
          Write your best roast and let our AI Comedy Judge score it on creativity, delivery, and humor.
          Top roasts earn bonus coins! Entry costs <strong>15 coins</strong>.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Roast Target (celebrity, topic, or fictional character)</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. Elon Musk, Monday mornings, Batman..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Your Roast</label>
            <Textarea
              value={roast}
              onChange={(e) => setRoast(e.target.value)}
              placeholder="Deliver your best roast line..."
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-orange-500 border-orange-500/30">
              <Coins className="h-3 w-3 mr-1" /> 15 Coins
            </Badge>
            <Button
              onClick={handleSubmitRoast}
              disabled={loading || !target.trim() || !roast.trim()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Flame className="h-4 w-4 mr-2" />
              {loading ? "Judging..." : "Submit Roast 🔥"}
            </Button>
          </div>
        </div>
      </Card>

      {aiScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-6 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="text-xl font-black">AI Judge Verdict</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-black text-orange-500">{aiScore.creativity || 0}/10</p>
                <p className="text-xs text-muted-foreground">Creativity</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-black text-purple-500">{aiScore.delivery || 0}/10</p>
                <p className="text-xs text-muted-foreground">Delivery</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-black text-pink-500">{aiScore.humor || 0}/10</p>
                <p className="text-xs text-muted-foreground">Humor</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">"{aiScore.feedback}"</p>
            {aiScore.bonus_coins > 0 && (
              <Badge className="mt-3 bg-yellow-500/20 text-yellow-500">
                <Zap className="h-3 w-3 mr-1" /> +{aiScore.bonus_coins} Bonus Coins Earned!
              </Badge>
            )}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
