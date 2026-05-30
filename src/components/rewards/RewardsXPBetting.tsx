import { useState, useRef } from "react";
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
] as const;

const VALID_TYPES = new Set(CHALLENGES.map((c) => c.value));

const parsePositiveInt = (v: string, max?: number): number | null => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return null;
  if (max !== undefined && n > max) return null;
  return n;
};

export default function RewardsXPBetting() {
  const [challengeType, setChallengeType] = useState<(typeof CHALLENGES)[number]["value"]>("posts");
  const [target, setTarget] = useState("3");
  const [amount, setAmount] = useState("50");
  const [hours, setHours] = useState("24");
  const [placing, setPlacing] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const placeLock = useRef(false);

  const { data: bets } = useQuery<Bet[]>({
    queryKey: ["xp-bets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("xp_bets")
        .select("*")
        .eq("user_id", user.id)
        .order("starts_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Bet[];
    },
  });

  const place = async () => {
    if (placeLock.current || placing) return;

    if (!VALID_TYPES.has(challengeType)) {
      toast({ title: "Invalid challenge type", variant: "destructive" });
      return;
    }
    const tgt = parsePositiveInt(target);
    const amt = parsePositiveInt(amount);
    const hrs = parsePositiveInt(hours, 168);
    if (tgt === null) {
      toast({ title: "Invalid target", description: "Whole number ≥ 1", variant: "destructive" });
      return;
    }
    if (amt === null) {
      toast({ title: "Invalid stake", description: "Whole number ≥ 1", variant: "destructive" });
      return;
    }
    if (hrs === null) {
      toast({ title: "Invalid deadline", description: "Whole number 1–168 hours", variant: "destructive" });
      return;
    }

    placeLock.current = true;
    setPlacing(true);
    try {
      const { data, error } = await supabase.rpc("place_xp_bet", {
        _challenge_type: challengeType,
        _target: tgt,
        _amount: amt,
        _hours: hrs,
      });
      if (error) {
        toast({ title: "Failed", description: error.message, variant: "destructive" });
        return;
      }
      const res = data as { error?: string; ok?: boolean };
      if (res?.error) {
        toast({ title: "Failed", description: res.error.replace(/_/g, " "), variant: "destructive" });
        return;
      }
      toast({
        title: "🎯 Bet placed!",
        description: `Stake of ${amt} XP locked. Win 2× if you complete the challenge in time.`,
      });
      qc.invalidateQueries({ queryKey: ["xp-bets"] });
      qc.invalidateQueries({ queryKey: ["rewards-stats"] });
      qc.invalidateQueries({ queryKey: ["gamification"] });
    } finally {
      setPlacing(false);
      placeLock.current = false;
    }
  };

  const active = bets?.filter((b) => b.status === "pending") ?? [];
  const history = bets?.filter((b) => b.status !== "pending") ?? [];
  const previewWin = (parsePositiveInt(amount) ?? 0) * 2;

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
            <label htmlFor="bet-type" className="text-xs font-semibold mb-1 block">Challenge type</label>
            <Select value={challengeType} onValueChange={(v) => setChallengeType(v as typeof challengeType)}>
              <SelectTrigger id="bet-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHALLENGES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="bet-target" className="text-xs font-semibold mb-1 block">Target count</label>
            <Input id="bet-target" type="number" inputMode="numeric" step={1} min={1} value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bet-amount" className="text-xs font-semibold mb-1 block">Stake (XP)</label>
            <Input id="bet-amount" type="number" inputMode="numeric" step={1} min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bet-hours" className="text-xs font-semibold mb-1 block">Deadline (hours, 1–168)</label>
            <Input id="bet-hours" type="number" inputMode="numeric" step={1} min={1} max={168} value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
        </div>

        <Button
          onClick={place}
          disabled={placing || active.length > 0}
          type="button"
          className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 text-white"
        >
          {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <><TrendingUp className="h-4 w-4 mr-1" /> Place Bet (Win {previewWin} XP)</>
          )}
        </Button>
        {active.length > 0 && (
          <p className="text-xs text-amber-500 mt-2 text-center">
            You already have an active bet — finish it first.
          </p>
        )}
      </Card>

      {active.length > 0 && (
        <Card className="p-4 bg-card/80 border-amber-400/20">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4 text-amber-500" /> Active Bet
          </h3>
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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
            <Trophy className="h-4 w-4 text-violet-500" /> History
          </h3>
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
