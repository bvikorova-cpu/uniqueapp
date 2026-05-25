import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Award, Flame, Shield, Zap, Crown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ReputationSystemProps {
  onBack: () => void;
}

const LEVELS = [
  { level: 1, name: "Newcomer", icon: "🌱", minPoints: 0, color: "text-green-400" },
  { level: 2, name: "Contributor", icon: "💬", minPoints: 50, color: "text-blue-400" },
  { level: 3, name: "Active Member", icon: "⚡", minPoints: 150, color: "text-yellow-400" },
  { level: 4, name: "Respected", icon: "🌟", minPoints: 400, color: "text-orange-400" },
  { level: 5, name: "Expert", icon: "🏆", minPoints: 1000, color: "text-purple-400" },
  { level: 6, name: "Legend", icon: "👑", minPoints: 2500, color: "text-rose-400" },
];

const BADGES_LIST = [
  { id: "first_post", name: "First Post", icon: "📝", desc: "Create your first forum post" },
  { id: "helpful_10", name: "Helpful Hero", icon: "🤝", desc: "Get 10 helpful votes" },
  { id: "posts_25", name: "Chatterbox", icon: "💬", desc: "Create 25 posts" },
  { id: "streak_7", name: "Weekly Warrior", icon: "🔥", desc: "Post 7 days in a row" },
  { id: "likes_50", name: "Crowd Favorite", icon: "❤️", desc: "Receive 50 likes" },
  { id: "debate_winner", name: "Debate Champion", icon: "🏅", desc: "Win a debate room" },
];

export const ReputationSystem = ({ onBack }: ReputationSystemProps) => {
  const { data: myRep } = useQuery({
    queryKey: ["my-forum-reputation"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("forum_reputation")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        const { data: newRep, error: insertError } = await supabase
          .from("forum_reputation")
          .insert({ user_id: user.id, points: 0, level: 1, badges: [], posts_count: 0, helpful_count: 0 })
          .select()
          .single();
        if (insertError) throw insertError;
        return newRep;
      }
      return data;
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["forum-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_reputation")
        .select("*")
        .order("points", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: leaderProfiles = {} } = useQuery({
    queryKey: ["leaderboard-profiles", leaderboard.map((l: any) => l.user_id)],
    queryFn: async () => {
      const ids = leaderboard.map((l: any) => l.user_id);
      if (ids.length === 0) return {};
      const { data } = await supabase.from("profiles_public" as any).select("id, full_name, avatar_url").in("id", ids);
      const map: Record<string, any> = {};
      data?.forEach(p => { map[p.id] = p; });
      return map;
    },
    enabled: leaderboard.length > 0,
  });

  const currentLevel = [...LEVELS].reverse().find(l => (myRep?.points || 0) >= l.minPoints) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minPoints > (myRep?.points || 0));
  const progress = nextLevel
    ? ((myRep?.points || 0) - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints) * 100
    : 100;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        🏆 Reputation & Karma
      </h2>

      {/* My Stats */}
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{currentLevel.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{currentLevel.name}</h3>
              <p className="text-sm text-muted-foreground">Level {currentLevel.level} • {myRep?.points || 0} karma points</p>
              {nextLevel && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{myRep?.points || 0} pts</span>
                    <span>{nextLevel.minPoints} pts to {nextLevel.name}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-accent/30">
              <p className="text-lg font-bold">{myRep?.posts_count || 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/30">
              <p className="text-lg font-bold">{myRep?.helpful_count || 0}</p>
              <p className="text-xs text-muted-foreground">Helpful</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/30">
              <p className="text-lg font-bold">{((myRep?.badges as any[]) || []).length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Available Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGES_LIST.map((badge) => {
              const earned = ((myRep?.badges as any[]) || []).includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.03 }}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    earned ? "border-primary/50 bg-primary/10" : "border-border/50 bg-accent/10 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-xs font-bold mt-1">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                  {earned && <Badge className="mt-1 text-[10px]">Earned</Badge>}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry: any, i: number) => {
              const profile = leaderProfiles[entry.user_id];
              const lvl = [...LEVELS].reverse().find(l => entry.points >= l.minPoints) || LEVELS[0];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <span className={`font-black text-lg w-6 text-center ${i < 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.full_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{profile?.full_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{lvl.icon} {lvl.name}</p>
                  </div>
                  <span className="font-bold text-sm">{entry.points} pts</span>
                </motion.div>
              );
            })}
            {leaderboard.length === 0 && (
              <p className="text-center text-muted-foreground py-6">No reputation data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
