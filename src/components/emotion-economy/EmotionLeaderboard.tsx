import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Crown, Medal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Row {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  score: number;
}

interface Props { onBack: () => void; }


export function EmotionLeaderboard({ onBack }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id ?? null);
      const { data, error } = await supabase.rpc("get_emotion_leaderboard", {
        _metric: "total",
        _limit: 20,
      });
      if (error) throw error;
      setRows(((data as Row[]) || []).map((r) => ({ ...r, score: Number(r.score) || 0 })));
    } catch (err) {
      console.error("Leaderboard error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // Live refresh whenever any wallet or source table changes
  useEffect(() => {
    const channel = supabase
      .channel("emotion-leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "emotion_wallets" }, fetchBoard)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "emotion_roulette_spins" }, fetchBoard)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "emotion_mood_generations" }, fetchBoard)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "emotion_exchange_matches" }, fetchBoard)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBoard]);

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-yellow-500 shrink-0" />;
    if (i === 1) return <Medal className="h-5 w-5 text-muted-foreground shrink-0" />;
    if (i === 2) return <Medal className="h-5 w-5 text-amber-600 shrink-0" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center shrink-0">#{i + 1}</span>;
  };


  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title="Live Leaderboard"
        intro="Ranks update in real time as people use the Emotion Economy tools."
        steps={[
          { title: "Roulette", desc: "Ranked by total emotion payout won on the wheel." },
          { title: "Mood readings", desc: "Ranked by how many AI mood readings were generated." },
          { title: "Swaps", desc: "Ranked by completed one-for-one emotion exchanges." },
          { title: "Climb the board", desc: "Every spin, reading and swap you make updates your rank instantly." },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Live Leaderboard
            <Badge variant="secondary" className="ml-auto text-[10px]">real-time</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Button
                key={t.key}
                variant={metric === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => setMetric(t.key)}
                className="gap-1.5"
              >
                <t.icon className="h-4 w-4" />
                <span className="text-xs">{t.label}</span>
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading ranks...
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No activity yet — be the first on the board!
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <motion.div
                  key={`${metric}-${r.user_id}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border min-w-0 ${
                    r.user_id === me
                      ? "border-primary/40 bg-primary/10"
                      : i < 3
                        ? "border-yellow-500/25 bg-yellow-500/5"
                        : "border-border/60 bg-muted/30"
                  }`}
                >
                  {rankIcon(i)}
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={r.avatar_url || undefined} alt={r.display_name || "Player"} />
                    <AvatarFallback className="text-xs">
                      {(r.display_name || "P").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium truncate flex-1 min-w-0">
                    {r.display_name || "Player"}
                    {r.user_id === me && <span className="ml-1 text-xs text-primary">(you)</span>}
                  </p>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {r.score.toLocaleString()} {unit}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
