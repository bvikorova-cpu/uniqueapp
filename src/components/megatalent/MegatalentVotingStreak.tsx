import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Calendar, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  userId: string | null;
}

const STREAK_REWARDS: { day: number; label: string }[] = [
  { day: 3, label: "+50 XP" },
  { day: 7, label: "+200 XP" },
  { day: 14, label: "Boost x1" },
  { day: 30, label: "Premium 1d" },
];

export default function MegatalentVotingStreak({ userId }: Props) {
  const [streak, setStreak] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [claimedDays, setClaimedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  const load = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const [{ data: votes, error: vErr }, { data: claims }] = await Promise.all([
        supabase.from("talent_votes").select("created_at").eq("user_id", userId).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }),
        supabase.from("mt_streak_claims").select("day").eq("user_id", userId),
      ]);
      if (vErr) throw vErr;

      const rows = votes || [];
      const daySet = new Set<string>();
      rows.forEach((r: any) => daySet.add(new Date(r.created_at).toISOString().slice(0, 10)));

      let s = 0;
      const d = new Date();
      while (true) {
        const k = d.toISOString().slice(0, 10);
        if (daySet.has(k)) { s++; d.setDate(d.getDate() - 1); }
        else if (s === 0 && k === new Date().toISOString().slice(0, 10)) { d.setDate(d.getDate() - 1); }
        else break;
      }
      setStreak(s);
      setTotalVotes(rows.length);
      setActiveDays(daySet);
      setClaimedDays(new Set((claims ?? []).map((c: any) => c.day)));
    } catch (e) {
      console.error("Streak error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await load(); })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const claim = async (day: number) => {
    setClaiming(day);
    try {
      const { data, error } = await supabase.functions.invoke("mt-claim-streak", { body: { day } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`Claimed ${(data as any)?.reward ?? "reward"}`);
      setClaimedDays((prev) => new Set([...prev, day]));
    } catch (e: any) {
      toast.error(e?.message ?? "Claim failed");
    } finally {
      setClaiming(null);
    }
  };

  if (!userId) return null;
  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;

  const days: { key: string; label: number; active: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.getDate(), active: activeDays.has(key) });
  }

  const nextReward = STREAK_REWARDS.find((r) => r.day > streak && !claimedDays.has(r.day)) || STREAK_REWARDS[STREAK_REWARDS.length - 1];

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-5 w-5 text-orange-500" />
          Voting Streak
          <Badge variant="secondary" className="ml-auto text-xs gap-1">
            <Calendar className="h-3 w-3" />
            {totalVotes} votes / 30d
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-black text-orange-500">{streak}</p>
            <p className="text-xs text-muted-foreground">day{streak === 1 ? "" : "s"} streak</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Gift className="h-3 w-3" />
              Next reward
            </p>
            <p className="text-sm font-bold">
              {nextReward.label} <span className="text-muted-foreground font-normal">@ day {nextReward.day}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold border ${
                d.active
                  ? "bg-orange-500/30 border-orange-500/60 text-orange-100"
                  : "bg-muted/30 border-border/30 text-muted-foreground"
              }`}
            >
              {d.label}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STREAK_REWARDS.map((r) => {
            const claimed = claimedDays.has(r.day);
            const eligible = streak >= r.day && !claimed;
            return (
              <Button
                key={r.day}
                variant={claimed ? "secondary" : eligible ? "default" : "outline"}
                size="sm"
                disabled={!eligible || claiming === r.day}
                onClick={() => claim(r.day)}
                className="text-[11px] h-8 justify-between"
              >
                <span>Day {r.day}: {r.label}</span>
                {claiming === r.day ? <Loader2 className="h-3 w-3 animate-spin" /> : claimed ? <span>✓</span> : eligible ? <span>Claim</span> : <span className="opacity-60">Locked</span>}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
