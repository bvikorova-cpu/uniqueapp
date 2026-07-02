import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Goal { id: string; title: string; target_credits: number; current_credits: number; reward_description: string | null; is_active: boolean; }

export function StreamGoalsCard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(100);
  const [reward, setReward] = useState("");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("shadow_stream_goals")
      .select("*").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(5);
    setGoals((data as Goal[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || target < 1) return;
    try {
      await shadowArenaCall("goal_create", { title, target_credits: target, reward_description: reward });
      setTitle(""); setReward(""); setTarget(100); await load(); toast.success("Goal set!");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
<Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold">Stream Goals</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <Input placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="number" placeholder="Credits target" value={target} onChange={(e) => setTarget(parseInt(e.target.value || "0"))} />
        <Input placeholder="Reward (optional)" value={reward} onChange={(e) => setReward(e.target.value)} />
      </div>
      <Button onClick={create} className="w-full mb-3">Add Goal</Button>
      <div className="space-y-2">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current_credits / g.target_credits) * 100));
          return (
            <div key={g.id} className="p-3 rounded border border-border/50 bg-black/30">
              <FloatingHowItWorks title="StreamGoalsCard — How it works" steps={[{title:"Open this section",desc:"Access StreamGoalsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{g.title}{!g.is_active && " ✅"}</span>
                <span className="text-amber-300">{g.current_credits}/{g.target_credits}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${pct}%` }} />
              </div>
              {g.reward_description && <p className="text-xs text-muted-foreground mt-1">🎁 {g.reward_description}</p>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
