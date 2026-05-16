import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QUESTS = [
  { id: "vote_3", label: "Vote on 3 submissions", reward: 5 },
  { id: "comment_1", label: "Leave 1 comment", reward: 3 },
  { id: "share_1", label: "Share a submission", reward: 4 },
  { id: "battle_vote", label: "Vote in a battle match", reward: 6 },
  { id: "story_watch", label: "Watch a story", reward: 2 },
];

const MegatalentDailyQuests = ({ userId }: { userId: string | null }) => {
  const [done, setDone] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!userId) { setDone({}); setLoading(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("daily_quest_completions")
        .select("quest_id, xp_awarded")
        .eq("user_id", userId)
        .eq("quest_date", today);
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => { map[r.quest_id] = r.xp_awarded; });
      setDone(map);
      setLoading(false);
    };
    load();
  }, [userId]);

  const complete = async (q: typeof QUESTS[number]) => {
    if (!userId) { toast.error("Login required"); return; }
    if (done[q.id]) return;
    setBusy(q.id);
    const { error } = await supabase.from("daily_quest_completions").insert({
      user_id: userId, quest_id: q.id, xp_awarded: q.reward,
    });
    setBusy(null);
    if (error) {
      if (error.code === "23505") {
        setDone(prev => ({ ...prev, [q.id]: q.reward }));
      } else {
        toast.error("Failed", { description: error.message });
      }
      return;
    }
    setDone(prev => ({ ...prev, [q.id]: q.reward }));
    toast.success(`+${q.reward} XP earned`);
  };

  const total = QUESTS.reduce((s, q) => s + q.reward, 0);
  const earned = QUESTS.reduce((s, q) => s + (done[q.id] || 0), 0);
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
          <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="space-y-2">
            {QUESTS.map(q => {
              const isDone = !!done[q.id];
              return (
                <label key={q.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 p-2 cursor-pointer hover:border-primary/40 transition">
                  <Checkbox checked={isDone} disabled={isDone || busy === q.id || !userId} onCheckedChange={() => complete(q)} />
                  <span className={`flex-1 text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>{q.label}</span>
                  <Badge variant="outline" className="text-xs">+{q.reward}</Badge>
                </label>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentDailyQuests;
