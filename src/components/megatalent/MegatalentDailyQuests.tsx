import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListChecks, Sparkles, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Server-validated quests: progress is COUNTED from real activity tables.
const QUESTS = [
  { id: "vote_3", label: "Vote on 3 submissions", reward: 5, target: 3, source: "talent_votes" as const },
  { id: "comment_1", label: "Leave 1 comment", reward: 3, target: 1, source: "talent_comments" as const },
  { id: "react_1", label: "React to 1 submission", reward: 2, target: 1, source: "mt_submission_reactions" as const },
  { id: "story_post", label: "Post a story", reward: 4, target: 1, source: "mt_stories" as const },
];

const startOfTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const MegatalentDailyQuests = ({ userId }: { userId: string | null }) => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [claimed, setClaimed] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setProgress({});
      setClaimed({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const since = startOfTodayISO();
    const today = since.slice(0, 10);

    // Already claimed
    const { data: doneRows } = await supabase
      .from("daily_quest_completions")
      .select("quest_id, xp_awarded")
      .eq("user_id", userId)
      .eq("quest_date", today);
    const cmap: Record<string, number> = {};
    (doneRows || []).forEach((r: any) => (cmap[r.quest_id] = r.xp_awarded));

    // Real progress counts (parallel)
    const counters = await Promise.all(
      QUESTS.map(async (q) => {
        const { count } = await (supabase as any)
          .from(q.source)
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", since);
        return [q.id, count ?? 0] as const;
      }),
    );
    const pmap: Record<string, number> = {};
    counters.forEach(([k, v]) => (pmap[k] = v));

    setProgress(pmap);
    setClaimed(cmap);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    // Detect day rollover (midnight) — reload to reset progress display
    let lastDate = new Date().toISOString().slice(0, 10);
    const t = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      if (today !== lastDate) {
        lastDate = today;
        load();
      }
    }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const claim = async (q: typeof QUESTS[number]) => {
    if (!userId) {
      toast.error("Sign in required");
      return;
    }
    if (claimed[q.id]) return;
    if ((progress[q.id] || 0) < q.target) {
      toast.error(`Need ${q.target - (progress[q.id] || 0)} more to claim`);
      return;
    }
    setBusy(q.id);
    const { data, error } = await (supabase as any).rpc("claim_daily_quest_secure", { _quest_id: q.id });
    setBusy(null);
    if (error) {
      const msg = error.message?.includes("progress_insufficient")
        ? "Progress not yet sufficient"
        : error.message?.includes("unknown_quest")
        ? "Unknown quest"
        : error.message || "Claim failed";
      toast.error(msg);
      return;
    }
    if (data?.ok === false && data?.reason === "already_claimed") {
      setClaimed((prev) => ({ ...prev, [q.id]: q.reward }));
      return;
    }
    const xp = (data?.xp_awarded as number) ?? q.reward;
    setClaimed((prev) => ({ ...prev, [q.id]: xp }));
    toast.success(`+${xp} XP claimed`);
  };

  const total = QUESTS.reduce((s, q) => s + q.reward, 0);
  const earned = QUESTS.reduce((s, q) => s + (claimed[q.id] || 0), 0);
  const pct = Math.round((earned / total) * 100);

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Daily Quests</h3>
          <Badge variant="secondary" className="ml-auto gap-1">
            <Sparkles className="h-3 w-3" /> {earned}/{total} XP
          </Badge>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-primary to-accent" />
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-2">
            {QUESTS.map((q) => {
              const done = !!claimed[q.id];
              const p = progress[q.id] || 0;
              const ready = p >= q.target && !done;
              return (
                <div key={q.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{q.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (p / q.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {Math.min(p, q.target)}/{q.target}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    +{q.reward}
                  </Badge>
                  <Button
                    size="sm"
                    variant={done ? "outline" : ready ? "default" : "ghost"}
                    disabled={done || !ready || busy === q.id}
                    onClick={() => claim(q)}
                    className="h-8 px-2 text-xs shrink-0"
                  >
                    {busy === q.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : done ? (
                      <Check className="h-3 w-3" />
                    ) : ready ? (
                      "Claim"
                    ) : (
                      "Locked"
                    )}
                  </Button>
                </div>
              );
            })}
            <Button variant="ghost" size="sm" className="w-full text-xs h-7 mt-1" onClick={load}>
              Refresh progress
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentDailyQuests;
