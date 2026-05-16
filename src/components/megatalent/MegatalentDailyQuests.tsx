import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";

const QUESTS = [
  { id: "q1", label: "Vote on 3 submissions", reward: 5 },
  { id: "q2", label: "Leave 1 comment", reward: 3 },
  { id: "q3", label: "Share a submission", reward: 4 },
  { id: "q4", label: "Vote in a battle match", reward: 6 },
  { id: "q5", label: "Watch a story", reward: 2 },
];

const todayKey = () => `mt_quests_${new Date().toISOString().slice(0, 10)}`;

const MegatalentDailyQuests = () => {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(todayKey()) || "{}")); } catch {}
  }, []);

  const toggle = (id: string, reward: number) => {
    setDone(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(todayKey(), JSON.stringify(next));
      if (next[id] && !prev[id]) toast.success(`+${reward} XP earned`);
      return next;
    });
  };

  const total = QUESTS.reduce((s, q) => s + q.reward, 0);
  const earned = QUESTS.reduce((s, q) => s + (done[q.id] ? q.reward : 0), 0);
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
        <div className="space-y-2">
          {QUESTS.map(q => (
            <label key={q.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 p-2 cursor-pointer hover:border-primary/40 transition">
              <Checkbox checked={!!done[q.id]} onCheckedChange={() => toggle(q.id, q.reward)} />
              <span className={`flex-1 text-sm ${done[q.id] ? "line-through text-muted-foreground" : ""}`}>{q.label}</span>
              <Badge variant="outline" className="text-xs">+{q.reward}</Badge>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentDailyQuests;
