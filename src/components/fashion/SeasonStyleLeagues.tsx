import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trophy, Crown, Medal, TrendingUp, Users, Calendar, Flame, Star, Shield } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

const CREDIT_COST = 10;

const LEAGUES = [
  { id: "bronze", name: "Bronze League", icon: Shield, color: "from-amber-700 to-amber-900", min: 0, max: 999 },
  { id: "silver", name: "Silver League", icon: Medal, color: "from-gray-400 to-gray-600", min: 1000, max: 2999 },
  { id: "gold", name: "Gold League", icon: Trophy, color: "from-yellow-400 to-amber-500", min: 3000, max: 5999 },
  { id: "platinum", name: "Platinum League", icon: Crown, color: "from-cyan-400 to-blue-500", min: 6000, max: 9999 },
  { id: "diamond", name: "Diamond League", icon: Star, color: "from-purple-400 to-pink-500", min: 10000, max: Infinity },
];

const SEASONS = ["Spring 2026", "Summer 2026", "Autumn 2026", "Winter 2026"];

export default function SeasonStyleLeagues() {
  const [activeSeason] = useState(SEASONS[0]);
  const { credits, spendCredit } = useAICredits();
  const queryClient = useQueryClient();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["fashion-league-leaderboard", activeSeason],
    queryFn: async () => {
      const { data: battles } = await supabase
        .from("fashion_style_battles")
        .select("creator_id")
        .eq("status", "completed");

      if (!battles) return [];
      const ids = Array.from(new Set(battles.map((b: any) => b.creator_id).filter(Boolean)));
      const { data: profs } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids);
      const pmap = new Map<string, any>((profs || []).map((p: any) => [p.id, p]));

      const scoreMap = new Map<string, { name: string; avatar: string; wins: number; score: number }>();
      battles.forEach((b: any) => {
        const id = b.creator_id;
        const p = pmap.get(id);
        const existing = scoreMap.get(id) || { name: p?.full_name || "Anonymous", avatar: p?.avatar_url || "", wins: 0, score: 0 };
        existing.wins += 1;
        existing.score += 150;
        scoreMap.set(id, existing);
      });

      return Array.from(scoreMap.entries())
        .map(([id, data]) => ({ id, ...data, league: LEAGUES.find(l => data.score >= l.min && data.score <= l.max) || LEAGUES[0] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "Season Style League Entry");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      toast.success("Successfully joined the league! Start competing in Style Battles to earn points.");
      queryClient.invalidateQueries({ queryKey: ["fashion-league-leaderboard"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const currentLeague = LEAGUES[0];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/20 via-primary/10 to-pink-500/20 border-primary/30 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Season Style Leagues</h2>
              <p className="text-sm text-muted-foreground">{activeSeason} • Compete for seasonal rankings • {CREDIT_COST} Credits to join</p>
            </div>
          </div>

          {/* Current Season */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {SEASONS.map((season, i) => (
              <div key={season} className={`p-3 rounded-lg text-center text-sm font-semibold ${i === 0 ? "bg-primary/20 border border-primary/40 text-primary" : "bg-background/40 text-muted-foreground"}`}>
                <Calendar className="h-4 w-4 mx-auto mb-1" />
                {season}
              </div>
            ))}
          </div>

          <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending || (credits?.credits_remaining || 0) < CREDIT_COST} className="gap-2">
            {joinMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Joining...</> : <><Flame className="h-4 w-4" /> Join League ({CREDIT_COST} Credits)</>}
          </Button>
        </div>
      </Card>

      {/* League Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {LEAGUES.map((league, i) => (
          <motion.div key={league.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`p-3 text-center bg-gradient-to-br ${league.color} border-none`}>
              <league.icon className="h-6 w-6 text-white mx-auto mb-1" />
              <p className="text-xs font-bold text-white">{league.name}</p>
              <p className="text-[10px] text-white/70">{league.max === Infinity ? `${league.min.toLocaleString()}+` : `${league.min.toLocaleString()}-${league.max.toLocaleString()}`} pts</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-white/10">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Season Leaderboard
        </h3>

        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No competitors yet</p>
            <p className="text-sm text-muted-foreground">Be the first to join this season's league!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, i) => (
              <motion.div key={player.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? "bg-primary/10 border border-primary/20" : "bg-background/50"}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-500 text-white" : i === 1 ? "bg-gray-400 text-white" : i === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.wins} wins • {player.league.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">{player.score.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
