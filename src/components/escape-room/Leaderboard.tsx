import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Lightbulb, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PointsEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  total_score: number;
  best_time_seconds: number | null;
  hints_used: number;
  last_escape: string | null;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<PointsEntry[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const [{ data }, { data: auth }] = await Promise.all([
        (supabase as any).rpc("get_escape_room_points_leaderboard", { _limit: 100 }),
        supabase.auth.getUser(),
      ]);
      setMyId(auth?.user?.id ?? null);
      setEntries((data as PointsEntry[]) || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const channel = supabase
      .channel("escape-leaderboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "escape_room_sessions" }, () => fetchLeaderboard())
      .subscribe();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchLeaderboard]);

  const formatTime = (seconds: number | null) => {
    if (!seconds || seconds <= 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-500/15 border border-yellow-500/30";
    if (index === 1) return "bg-muted/60 border border-border";
    if (index === 2) return "bg-orange-500/15 border border-orange-500/30";
    return "bg-card/50 border border-border/50";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const myRank = myId ? entries.findIndex((e) => e.user_id === myId) : -1;

  return (
    <>
      <FloatingHowItWorks
        title={"Leaderboard - How it works"}
        steps={[
          { title: "Play", desc: "Unlock an escape room with credits and start solving." },
          { title: "Escape", desc: "Finish the room to record a completed session." },
          { title: "Earn points", desc: "Every completed escape room gives you exactly 1 point." },
          { title: "Climb", desc: "Ties are broken by total score, then by your fastest escape." },
        ]}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <CardTitle>Global Leaderboard</CardTitle>
          </div>
          <CardDescription>
            1 point for every completed escape room — live data from all players
          </CardDescription>
          {myRank >= 0 && (
            <Badge className="w-fit bg-amber-500/20 text-amber-600 border-amber-500/30">
              Your rank: #{myRank + 1} • {entries[myRank].points} {entries[myRank].points === 1 ? "point" : "points"}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries yet. Be the first to complete a room!
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg ${getRankColor(index)} ${entry.user_id === myId ? "ring-1 ring-amber-500/50" : ""}`}
                >
                  <div className="text-lg sm:text-2xl font-bold w-9 sm:w-12 text-center shrink-0">
                    {getRankIcon(index)}
                  </div>

                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={entry.avatar_url || undefined} alt={entry.display_name || "Player"} />
                    <AvatarFallback>{(entry.display_name || "P").slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{entry.display_name || "Player"}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(entry.best_time_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        {entry.hints_used}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {entry.total_score}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-amber-500">{entry.points}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {entry.points === 1 ? "point" : "points"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Leaderboard;
