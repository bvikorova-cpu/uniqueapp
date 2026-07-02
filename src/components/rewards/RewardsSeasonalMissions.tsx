import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Snowflake, Sun, Leaf, Clock, CheckCircle2, Gift, Target, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const seasons = [
  { id: "spring", name: "Spring Bloom", emoji: "🌸", icon: Leaf, color: "from-green-500 to-emerald-500" },
  { id: "summer", name: "Summer Festival", emoji: "☀️", icon: Sun, color: "from-amber-500 to-orange-500" },
  { id: "autumn", name: "Harvest Season", emoji: "🍂", icon: Leaf, color: "from-orange-600 to-red-600" },
  { id: "winter", name: "Winter Gala", emoji: "❄️", icon: Snowflake, color: "from-blue-400 to-cyan-500" },
];

interface MissionRow {
  mission_id: string;
  season: string;
  emoji: string;
  title: string;
  description: string;
  metric: string;
  target: number;
  reward_label: string;
  xp_reward: number;
  starts_at: string;
  ends_at: string;
  progress: number;
  claimed_at: string | null;
  is_complete: boolean;
}

export default function RewardsSeasonalMissions() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["seasonal-missions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_mission_progress" as any);
      if (error) throw error;
      return (data ?? []) as MissionRow[];
    },
  });

  const claim = useMutation({
    mutationFn: async (missionId: string) => {
      const { data, error } = await supabase.rpc("claim_mission_reward" as any, { _mission_id: missionId });
      if (error) throw error;
      return data as { success: boolean; xp_awarded?: number; reward?: string; error?: string };
    },
    onSuccess: (res) => {
      if (res?.success) {
        toast({ title: "Reward claimed! 🎉", description: `+${res.xp_awarded} XP · ${res.reward}` });
        qc.invalidateQueries({ queryKey: ["seasonal-missions"] });
        qc.invalidateQueries({ queryKey: ["user-points"] });
      } else {
        toast({ title: "Could not claim", description: res?.error ?? "Try again", variant: "destructive" });
      }
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Determine the active season based on the first mission's season, fallback to summer
  const activeSeasonId = missions[0]?.season ?? "summer";
  const activeSeason = seasons.find(s => s.id === activeSeasonId) ?? seasons[1];
  const earliestEnd = missions.reduce<string | null>((acc, m) => (!acc || m.ends_at < acc ? m.ends_at : acc), null);
  const daysLeft = earliestEnd ? Math.max(0, Math.ceil((new Date(earliestEnd).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Seasonal Missions" intro="Limited-time missions tied to the current season. Complete them before the season ends." steps={[
        { title: "Season banner", desc: "The top card shows the active season and how much time is left before missions rotate." },
        { title: "Track progress", desc: "Each mission has a progress bar. Actions across the platform automatically count toward it." },
        { title: "Claim on completion", desc: "When a mission hits 100%, tap Claim to grab the reward (XP, credits, seasonal cosmetics)." },
        { title: "Expiring items", desc: "Seasonal cosmetics disappear when the next season starts — claim before the timer runs out!" },
      ]} /></div>
      <Card className={`p-4 bg-gradient-to-br ${activeSeason.color}/10 border-amber-400/20 backdrop-blur-md`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${activeSeason.color} flex items-center justify-center`}>
              <span className="text-2xl">{activeSeason.emoji}</span>
            </div>
            <div>
              <h3 className="font-black text-lg">{activeSeason.name}</h3>
              <p className="text-xs text-muted-foreground">Active Now · {missions.length} missions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-amber-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {daysLeft} days left</p>
            <p className="text-[10px] text-muted-foreground">Complete missions for exclusive badges</p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {seasons.map(s => (
            <div key={s.id} className={`flex-1 text-center p-2 rounded-lg text-xs font-bold ${s.id === activeSeason.id ? `bg-gradient-to-r ${s.color} text-white` : "bg-muted/20 text-muted-foreground"}`}>
              <span className="text-sm block">{s.emoji}</span>
              {s.name.split(" ")[0]}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-card/80 backdrop-blur-md border-amber-400/15">
        <h3 className="font-bold flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-amber-500" /> Active Missions</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading missions…
          </div>
        ) : missions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No active missions right now. Check back soon!</p>
        ) : (
          <div className="space-y-3">
            {missions.map((m, i) => {
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
              const isClaimed = !!m.claimed_at;
              return (
                <motion.div key={m.mission_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-xl border ${isClaimed ? "bg-muted/20 border-border/20 opacity-70" : m.is_complete ? "bg-green-500/10 border-green-500/30" : "bg-muted/10 border-border/20"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.emoji}</span>
                      <div>
                        <p className="font-bold text-sm">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">{m.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-500">+{m.xp_reward} XP</p>
                      <p className="text-[10px] text-muted-foreground">{m.progress}/{m.target}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    {m.is_complete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Gift className="h-3 w-3" /> {m.reward_label}</p>
                    {m.is_complete && !isClaimed && (
                      <Button size="sm" className="h-7 text-xs" onClick={() => claim.mutate(m.mission_id)} disabled={claim.isPending}>
                        {claim.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Claim"}
                      </Button>
                    )}
                    {isClaimed && <span className="text-[10px] font-bold text-green-500">✓ Claimed</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
