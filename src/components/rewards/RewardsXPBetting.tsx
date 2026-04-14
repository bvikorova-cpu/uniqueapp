import { useState } from "react";
import { motion } from "framer-motion";
import { Sword, Loader2, CreditCard, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

export default function RewardsXPBetting() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [challengeType, setChallengeType] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [currentXP, setCurrentXP] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!betAmount || !challengeType) {
      toast({ title: "Required", description: "Choose a bet and challenge type", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "xp_betting", bet_amount: betAmount, challenge_type: challengeType, risk_level: riskLevel, current_xp: currentXP },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const bets = [
    { amount: "25", multiplier: "1.5x", risk: "Low", color: "border-green-500/30 bg-green-500/10" },
    { amount: "50", multiplier: "2x", risk: "Medium", color: "border-yellow-500/30 bg-yellow-500/10" },
    { amount: "100", multiplier: "3x", risk: "High", color: "border-orange-500/30 bg-orange-500/10" },
    { amount: "250", multiplier: "5x", risk: "Extreme", color: "border-red-500/30 bg-red-500/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Sword className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">XP Betting Arena</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 5 credits per bet analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {bets.map(b => (
            <button
              key={b.amount}
              onClick={() => { setBetAmount(b.amount); setRiskLevel(b.risk); }}
              className={`rounded-lg border p-2.5 text-center transition-all ${betAmount === b.amount ? "ring-2 ring-amber-500 shadow-lg" : ""} ${b.color}`}
            >
              <p className="text-sm font-black">{b.amount} XP</p>
              <p className="text-[10px] font-bold text-amber-500">{b.multiplier}</p>
              <p className="text-[9px] text-muted-foreground">{b.risk} Risk</p>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Input placeholder="Custom bet amount (XP)" value={betAmount} onChange={e => setBetAmount(e.target.value)} />
          <Select value={challengeType} onValueChange={setChallengeType}>
            <SelectTrigger><SelectValue placeholder="Challenge type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="posting-streak">Posting Streak Challenge</SelectItem>
              <SelectItem value="engagement-race">Engagement Race</SelectItem>
              <SelectItem value="badge-hunt">Badge Hunting Sprint</SelectItem>
              <SelectItem value="xp-marathon">XP Marathon</SelectItem>
              <SelectItem value="community-leader">Community Leader Challenge</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Your current XP balance" value={currentXP} onChange={e => setCurrentXP(e.target.value)} />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing Bet...</> : <><Sword className="h-4 w-4 mr-2" /> Analyze Bet — 5 Credits</>}
        </Button>
      </Card>

      {result && (
        <Card className="p-5 bg-card/90 backdrop-blur-md border-red-400/20">
          <h4 className="font-bold mb-3 text-red-500">⚔️ Betting Analysis</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
