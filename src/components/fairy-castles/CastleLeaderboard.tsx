import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  stamps: number;
  xp: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  stamps: number;
  xp: number;
  avatar: string;
  isYou: boolean;
}

const AVATAR_EMOJIS = ["👸", "🤴", "🧙", "👧", "👦", "🧝", "🦸", "🧚", "🦄", "⭐"];

interface CastleLeaderboardProps {
  userStamps: number;
}

interface Progress {
  totalCastles: number;
  visited: number;
  completed: number;
  stamps: number;
}

export function CastleLeaderboard({ userStamps }: CastleLeaderboardProps) {
  const { user } = useAuth();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["castle-leaderboard"],
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data, error } = await supabase.rpc("get_castle_leaderboard", { limit_count: 10 });
      if (error) throw error;
      return (data ?? []) as LeaderboardRow[];
    },
    staleTime: 60_000 });

  const leaderboard = useMemo<LeaderboardEntry[]>(() => { const base: LeaderboardEntry[] = (rows ?? []).map((r, i) => ({
      rank: i + 1,
      name: r.display_name || "Explorer",
      stamps: Number(r.stamps) || 0,
      xp: Number(r.xp) || 0,
      avatar: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
      isYou: !!user && r.user_id === user.id }));

    if (user && !base.some((e) => e.isYou)) { base.push({
        rank: base.length + 1,
        name: "You",
        stamps: userStamps,
        xp: userStamps * 400,
        avatar: "⭐",
        isYou: true });
    }

    return base
      .sort((a, b) => b.xp - a.xp || b.stamps - a.stamps)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [rows, user, userStamps]);

  // Real progress for the challenge tracker
  const { data: progress } = useQuery({
    queryKey: ["castle-challenge-progress", user?.id],
    queryFn: async (): Promise<Progress> => {
      const { count: totalCastles } = await supabase
        .from("fairy_castles")
        .select("id", { count: "exact", head: true });

      if (!user) {
        return { totalCastles: totalCastles ?? 0, visited: 0, completed: 0, stamps: 0 };
      }

      const [{ data: visits }, { count: stamps }] = await Promise.all([
        supabase.from("user_castle_visits").select("castle_id, completed").eq("user_id", user.id),
        supabase
          .from("user_castle_stamps")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id) ]);

      return {
        totalCastles: totalCastles ?? 0,
        visited: new Set((visits ?? []).map((v) => v.castle_id)).size,
        completed: (visits ?? []).filter((v) => v.completed).length,
        stamps: stamps ?? 0 };
    },
    staleTime: 30_000 });

  const totalCastles = progress?.totalCastles || 0;

  const challenges = useMemo(() => [
    {
      title: "Explorer 🗺️",
      desc: "Start a tour in 3 different castles",
      reward: "+50 XP",
      current: Math.min(progress?.visited ?? 0, 3),
      goal: 3 },
    {
      title: "Tour Finisher 🏁",
      desc: "Complete 3 full castle tours",
      reward: "+75 XP",
      current: Math.min(progress?.completed ?? 0, 3),
      goal: 3 },
    {
      title: "Stamp Collector 🏆",
      desc: totalCastles ? `Earn all ${totalCastles} explorer stamps` : "Earn explorer stamps",
      reward: "+100 XP",
      current: progress?.stamps ?? 0,
      goal: totalCastles || 1 },
  ], [progress, totalCastles]);



  return (
    <>
      <FloatingHowItWorks title={"Castle Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
    >
      {/* Leaderboard */}
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-bold">Top Explorers</h3>
        </div>

        <div className="space-y-2">
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && leaderboard.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Be the first to earn a castle stamp!
            </p>
          )}
          {leaderboard.map((entry, i) => {
            const isYou = entry.isYou;
            const rankIcon = entry.rank === 1 ? <Crown className="h-4 w-4 text-amber-500" />
              : entry.rank === 2 ? <Medal className="h-4 w-4 text-gray-400" />
              : entry.rank === 3 ? <Medal className="h-4 w-4 text-amber-700" />
              : null;

            return (
              <motion.div
                key={`${entry.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isYou ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-sm text-muted-foreground">
                    {rankIcon || `#${entry.rank}`}
                  </span>
                  <span className="text-xl">{entry.avatar}</span>
                  <div>
                    <p className={`text-sm font-semibold ${isYou ? "text-primary" : ""}`}>
                      {isYou ? "You" : entry.name} {isYou && "⬅️"}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.stamps}/6 stamps</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{entry.xp} XP</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-bold">Weekly Challenges</h3>
        </div>

        <div className="space-y-3">
          {challenges.map((ch, i) => (
            <motion.div
              key={ch.title}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold">{ch.title}</h4>
                <span className="text-xs font-bold text-green-500">{ch.reward}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ch.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
    </>
  );
}
