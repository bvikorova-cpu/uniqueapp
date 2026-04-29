import { useState } from "react";
import { motion } from "framer-motion";
import { Sword, Loader2, TrendingUp, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Bet {
  id: string;
  challenge_type: string;
  challenge_target: number;
  bet_amount: number;
  status: string;
  starts_at: string;
  ends_at: string;
  payout: number;
  progress: number;
}

const CHALLENGES = [
  { value: "posts", label: "Create posts" },
  { value: "comments", label: "Write comments" },
  { value: "hashtags", label: "Use hashtags in posts" },
  { value: "spins", label: "Spin lucky wheel" },
];

export default function RewardsXPBetting() {
  const [challengeType, setChallengeType] = useState("posts");
  const [target, setTarget] = useState("3");
  const [amount, setAmount] = useState("50");
  const [hours, setHours] = useState("24");
  const [placing, setPlacing] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bets } = useQuery<Bet[]>({
    queryKey: ["xp-bets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("xp_bets")
        .select("*")
        .eq("user_id", user.id)
        .order("starts_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Bet[];
    },
  });

  const place = async () => {
    setPlacing(true);
    const { data, error } = await supabase.rpc("place_xp_bet", {
      _challenge_type: challengeType,
      _target: parseInt(target, 10),
      _amount: parseInt(amount, 10),
      _hours: parseInt(hours, 10),
    });
    setPlacing(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const res = data as { error?: string; ok?: boolean };
    if (res?.error) { toast({ title: "Failed", description: res.error.replace(/_/g, " "), variant: "destructive" }); return; }
    toast({ title: "🎯 Bet placed!", description: `Stake of ${amount} XP locked. Win 2× if you complete the challenge in time.` });
    qc.invalidateQueries({ queryKey: ["xp-bets"] });
    qc.invalidateQueries({ queryKey: ["rewards-stats"] });
    qc.invalidateQueries({ queryKey: ["gamification"] });
  };

  const active = bets?.filter((b) => b.status === "pending") ?? [];
  const history = bets?.filter((b) => b.status !== "pending") ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-400/20 backdrop-blur-md">
        <h2 className="font-black text-xl flex items-center gap-2 mb-1">
          <Sword className="h-5 w-5 text-red-500" /> XP Betting Arena
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Stake XP on a personal challenge. Win 2× if you hit the target before the deadline. Lose your stake otherwise.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Challenge type</label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHALLENGES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Target count</label>
            <Input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Stake (XP)</label>
            <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Deadline (hours)</label>
            <Input type="number" min={1} max={168} value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
        </div>

        <Button onClick={place} disabled={placing || active.length > 0} className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 text-white">
          {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><TrendingUp className="h-4 w-4 mr-1" /> Place Bet (Win {parseInt(amount,10)*2 || 0} XP)</>}
        </Button>
        {active.length > 0 && <p className="text-xs text-amber-500 mt-2 text-center">You already have an active bet — finish it first.</p>}
      </Card>

      {active.length > 0 && (
        <Card className="p-4 bg-card/80 border-amber-400/20">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><Clock className="h-4 w-4 text-amber-500" /> Active Bet</h3>
          {active.map((b) => (
            <div key={b.id} className="text-sm space-y-1">
              <p>{b.challenge_type} → target {b.challenge_target} · stake {b.bet_amount} XP</p>
              <p className="text-xs text-muted-foreground">Ends {new Date(b.ends_at).toLocaleString()}</p>
            </div>
          ))}
        </Card>
      )}

      {history.length > 0 && (
        <Card className="p-4 bg-card/80 border-violet-400/15">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><Trophy className="h-4 w-4 text-violet-500" /> History</h3>
          <div className="space-y-2">
            {history.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                <span>{b.challenge_type} · {b.progress}/{b.challenge_target}</span>
                <Badge variant={b.status === "won" ? "default" : "secondary"}>
                  {b.status === "won" ? `+${b.payout} XP` : `-${b.bet_amount} XP`}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
